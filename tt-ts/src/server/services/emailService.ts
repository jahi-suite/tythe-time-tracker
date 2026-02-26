import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { DB } from '../../shared/constants.js';
import { query } from '../db/connection.js';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@karisuite.com';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

if (SMTP_USER && SMTP_PASS) {
  console.log(`[EmailService] SMTP configured: host=${SMTP_HOST} port=${SMTP_PORT} user=${SMTP_USER}`);
} else {
  console.log(`[EmailService] SMTP NOT configured — set SMTP_USER and SMTP_PASS in .env`);
}

if (process.env.NODE_ENV === 'production' && APP_BASE_URL.includes('localhost')) {
  console.warn(`[EmailService] WARNING: APP_BASE_URL is set to localhost in production: ${APP_BASE_URL}`);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASS ? {
    user: SMTP_USER,
    pass: SMTP_PASS,
  } : undefined,
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendWithRetry(mailOptions: nodemailer.SendMailOptions, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await transporter.sendMail(mailOptions);
      return;
    } catch (error) {
      console.error(`SMTP attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      await sleep(delay);
    }
  }
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function hashToken(token: string): Promise<string> {
  // Use bcrypt for token hashing as planned
  return bcrypt.hash(token, 10);
}

export async function compareToken(token: string, hash: string): Promise<boolean> {
  // Constant-time comparison is built-in to bcrypt.compare
  return bcrypt.compare(token, hash);
}

export async function sendVerificationEmail(venueEmail: string, venueName: string, token: string) {
  const verifyLink = `${APP_BASE_URL}/api/venues/verify-email?token=${token}`;
  
  const mailOptions: nodemailer.SendMailOptions = {
    from: EMAIL_FROM,
    to: venueEmail,
    subject: 'Verify your venue to activate KariSuite',
    text: `Hello ${venueName},\n\nPlease verify your email to activate your KariSuite venue by clicking the link below:\n\n${verifyLink}\n\nThis link will expire in 24 hours.\n\nThank you!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Verify your venue to activate KariSuite</h1>
        <p>Hello ${venueName},</p>
        <p>Please verify your email to activate your KariSuite venue by clicking the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
        </div>
        <p>Alternatively, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verifyLink}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  const hasSmtp = !!(SMTP_USER && SMTP_PASS);
  if (!hasSmtp) {
    const error = new Error(`SMTP not configured — set SMTP_USER and SMTP_PASS in .env. Verification link for ${venueEmail}: ${verifyLink}`);
    console.error(`[EmailService] ERROR: ${error.message}`);
    throw error;
  }

  try {
    await sendWithRetry(mailOptions);
    console.log(`[EmailService] verification_email_sent to=${venueEmail}`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[EmailService] verification_email_failed to=${venueEmail} reason=${reason}`);
    throw error;
  }
}

/**
 * Result of a resend operation.
 */
export interface ResendResult {
  ok: boolean;
  rateLimited?: boolean;
  retryAfterMinutes?: number;
  message?: string;
}

/**
 * Resend verification email for a venue.
 * Implementation follows anti-enumeration: never reveals if account exists.
 */
export async function resendVerificationEmail(venueId: string): Promise<ResendResult> {
  console.log(`[EmailService] resend_requested venueId=${venueId}`);
  const res = await query<{
    id: string;
    slug: string;
    name: string;
    admin_email: string;
    is_founder: boolean;
    email_verified: boolean;
  }>(
    `SELECT ${DB.ID_COLUMN} as id, slug, name, ${DB.ADMIN_EMAIL_COLUMN} as admin_email,
            ${DB.IS_FOUNDER_COLUMN} as is_founder,
            ${DB.EMAIL_VERIFIED_COLUMN} as email_verified
     FROM ${DB.VENUES_TABLE}
     WHERE ${DB.ID_COLUMN} = $1`,
    [venueId]
  );

  const venue = res.rows[0];

  // Anti-enumeration: if venue not found, or already verified, or founder, just return
  if (!venue || venue.is_founder || venue.email_verified || !venue.admin_email) {
    return { ok: true }; // Still say "ok" to avoid enumeration
  }

  // Rate limit check: 5 per hour using audit_log
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentEmailsRes = await query<{ count: string; last_sent: Date | null }>(
    `SELECT COUNT(*) as count, MAX(created_at) as last_sent 
     FROM ${DB.AUDIT_LOG_TABLE} 
     WHERE ${DB.VENUE_ID_COLUMN} = $1 
       AND target_table = 'venues' 
       AND new_values->>'event' = 'verification_email_sent'
       AND created_at > $2`,
    [venue.id, oneHourAgo]
  );
  
  const count = parseInt(recentEmailsRes.rows[0].count, 10);
  if (count >= 5) {
    const lastSent = recentEmailsRes.rows[0].last_sent ? new Date(recentEmailsRes.rows[0].last_sent) : oneHourAgo;
    const retryAfterMinutes = Math.max(1, Math.ceil((lastSent.getTime() + 60 * 60 * 1000 - Date.now()) / (60 * 1000)));
    console.log(`[EmailService] resend_rate_limited venueId=${venueId} count=${count}`);
    return { ok: false, rateLimited: true, retryAfterMinutes };
  }

  const token = generateToken();
  const tokenHash = await hashToken(token);

  await query(
    `UPDATE ${DB.VENUES_TABLE}
     SET ${DB.VERIFICATION_TOKEN_HASH_COLUMN} = $1,
         ${DB.VERIFICATION_SENT_AT_COLUMN} = NOW()
     WHERE ${DB.ID_COLUMN} = $2`,
    [tokenHash, venue.id]
  );

  // Record in audit log for rate limiting
  const { insertAuditLog } = await import('../db/repository.js');
  await insertAuditLog(
    'add',
    'venues',
    venue.id,
    'system',
    null,
    { event: 'verification_email_sent' },
    venue.id
  );

  await sendVerificationEmail(venue.admin_email, venue.name, token);
  return { ok: true };
}
