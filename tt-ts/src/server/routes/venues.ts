import { Router } from 'express'
import type pg from 'pg'
import { DB } from '../../shared/constants.js'
import { hashPassword } from '../auth/index.js'
import { getClient, query } from '../db/connection.js'
import { createIpRateLimit } from '../middleware/rateLimit.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import * as auth from '../auth/index.js'
import * as emailService from '../services/emailService.js'

const router = Router()

const createVenueRateLimit = createIpRateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many venue creation attempts, please try again later',
})

type VenueSearchRow = {
  slug: string
  name: string
}

function slugifyVenueName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCreateVenueBody(body: unknown): {
  venueName: string
  username: string
  password: string
  displayName: string
  adminEmail: string
} {
  const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  return {
    venueName: String(record.venueName ?? record.name ?? '').trim(),
    username: String(record.adminUsername ?? record.username ?? '').trim(),
    password: String(record.adminPassword ?? record.password ?? ''),
    displayName: String(record.adminDisplayName ?? record.displayName ?? '').trim(),
    adminEmail: String(record.adminEmail ?? record.email ?? '').trim(),
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const maybePg = error as Partial<pg.DatabaseError> & { code?: string }
  return maybePg.code === '23505'
}

router.get('/verify-email', async (req, res) => {
  const token = String(req.query.token ?? '').trim()
  if (!token) {
    res.status(400).send('Verification token is required')
    return
  }

  const client = await getClient()
  try {
    // Find venue with an active token
    const result = await client.query<{
      id: string;
      slug: string;
      verification_token_hash: string;
      verification_sent_at: Date;
    }>(
      `SELECT ${DB.ID_COLUMN} as id, slug, ${DB.VERIFICATION_TOKEN_HASH_COLUMN} as verification_token_hash, ${DB.VERIFICATION_SENT_AT_COLUMN} as verification_sent_at
       FROM ${DB.VENUES_TABLE}
       WHERE ${DB.VERIFICATION_TOKEN_HASH_COLUMN} IS NOT NULL
         AND ${DB.EMAIL_VERIFIED_COLUMN} = FALSE`
    )

    let foundVenue = null
    for (const row of result.rows) {
      if (await emailService.compareToken(token, row.verification_token_hash)) {
        foundVenue = row
        break
      }
    }

    if (!foundVenue) {
      console.log('[Venues] verification_failed reason=invalid_token')
      res.status(400).send('Invalid or expired verification token')
      return
    }

    // Check expiry (24h)
    const sentAt = new Date(foundVenue.verification_sent_at).getTime()
    const now = Date.now()
    if (now - sentAt > 24 * 60 * 60 * 1000) {
      console.log(`[Venues] verification_failed reason=expired venueId=${foundVenue.id}`)
      res.status(400).send('Verification token has expired. Please request a new one.')
      return
    }

    // Mark as verified
    await client.query(
      `UPDATE ${DB.VENUES_TABLE}
       SET ${DB.EMAIL_VERIFIED_COLUMN} = TRUE,
           ${DB.VERIFICATION_TOKEN_HASH_COLUMN} = NULL
       WHERE ${DB.ID_COLUMN} = $1`,
      [foundVenue.id]
    )

    console.log(`[Venues] verification_success venueId=${foundVenue.id}`)

    // Redirect to login or dashboard
    res.redirect(`/${foundVenue.slug}/login?verified=true`)
  } catch (error) {
    console.error('Error during email verification', error)
    res.status(500).send('An error occurred during verification')
  } finally {
    client.release()
  }
})

/** Dev only: mark current venue as verified without email. Requires auth + localhost. */
router.post('/verify-dev-bypass', requireAuth, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const host = (req.hostname || req.get('host') || '').split(':')[0].toLowerCase()
  if (host !== 'localhost' && host !== '127.0.0.1' && host !== '::1') {
    res.status(403).json({ error: 'Dev bypass only available on localhost' })
    return
  }
  const venueId = req.session?.venue_id
  if (!venueId) {
    res.status(400).json({ error: 'No venue in session' })
    return
  }
  await query(
    `UPDATE ${DB.VENUES_TABLE}
     SET ${DB.EMAIL_VERIFIED_COLUMN} = TRUE, ${DB.VERIFICATION_TOKEN_HASH_COLUMN} = NULL
     WHERE ${DB.ID_COLUMN} = $1`,
    [venueId]
  )
  console.log(`[Venues] verify_dev_bypass venueId=${venueId}`)
  res.json({ ok: true, message: 'Venue marked as verified. Refresh the page.' })
})

router.post('/resend-verification', async (req, res) => {
  const sessionVenueId = req.session?.venue_id
  const bodyVenueId = String(req.body.venueId ?? '').trim()
  const venueId = sessionVenueId || bodyVenueId

  if (!venueId) {
    res.status(400).json({ error: 'Venue ID is required' })
    return
  }

  try {
    const result = await emailService.resendVerificationEmail(venueId)
    if (result.rateLimited) {
      res.status(429).json({
        error: `Too many resend attempts. Please try again in ${result.retryAfterMinutes} minutes.`,
        retryAfterMinutes: result.retryAfterMinutes,
      })
      return
    }
    // Anti-enumeration: always return success
    res.json({ message: 'If the account exists and is not verified, a new email has been sent.' })
  } catch (error) {
    console.error('Error resending verification email', error)
    const hint = emailService.getSmtpErrorHint(error)
    const errorMsg = hint
      ? `Failed to resend verification email. ${hint}`
      : 'Failed to resend verification email. Check server logs for verification link, or verify SMTP_HOST, SMTP_USER, SMTP_PASS in .env.'
    res.status(500).json({ error: errorMsg })
  }
})

router.get('/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim()
  if (!q) {
    res.json([])
    return
  }

  const result = await query<VenueSearchRow>(
    `SELECT slug, name
     FROM ${DB.VENUES_TABLE}
     WHERE active = true
       AND (slug ILIKE $1 OR name ILIKE $1)
     ORDER BY
       CASE WHEN slug = LOWER($2) THEN 0 ELSE 1 END,
       CASE WHEN LOWER(name) = LOWER($2) THEN 0 ELSE 1 END,
       name ASC
     LIMIT 10`,
    [`%${q}%`, q]
  )

  res.json(
    result.rows.map((row) => ({
      slug: row.slug,
      name: row.name,
    }))
  )
})

router.get('/current/settings', requireAuth, async (req, res) => {
  const sessionVenueId = req.session?.venue_id
  if (!sessionVenueId) {
    res.status(400).json({ error: 'Venue context missing from session' })
    return
  }

  const settings = await auth.getVenueSettings(sessionVenueId)
  res.json(settings)
})

router.get('/:slug/settings', requireAdmin, async (req, res) => {
  const slug = String(req.params.slug ?? '').trim()
  const sessionVenueId = req.session?.venue_id
  if (!slug || !sessionVenueId) {
    res.status(400).json({ error: 'Slug required' })
    return
  }
  const venue = await auth.getVenueBySlug(slug)
  if (!venue) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }
  if (venue.id !== sessionVenueId) {
    res.status(403).json({ error: 'Can only view your own venue settings' })
    return
  }
  const settings = await auth.getVenueSettings(venue.id)
  res.json(settings)
})

router.put('/:slug/settings', requireAdmin, async (req, res) => {
  const slug = String(req.params.slug ?? '').trim()
  const sessionVenueId = req.session?.venue_id
  if (!slug || !sessionVenueId) {
    res.status(400).json({ error: 'Slug required' })
    return
  }
  const venue = await auth.getVenueBySlug(slug)
  if (!venue) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }
  if (venue.id !== sessionVenueId) {
    res.status(403).json({ error: 'Can only edit your own venue settings' })
    return
  }
  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>
  const enhanced_enabled = body.enhanced_enabled
  const enhanced_start_hour = body.enhanced_start_hour != null ? Number(body.enhanced_start_hour) : undefined
  const enhanced_end_hour = body.enhanced_end_hour != null ? Number(body.enhanced_end_hour) : undefined
  const break_deduct_enabled = body.break_deduct_enabled
  const break_deduct_minutes = body.break_deduct_minutes != null ? Number(body.break_deduct_minutes) : undefined
  const break_threshold_hours = body.break_threshold_hours != null ? Number(body.break_threshold_hours) : undefined
  const supervisor_enabled = body.supervisor_enabled
  const supervisor_label = body.supervisor_label != null ? String(body.supervisor_label).trim() : undefined
  const supervisor_deduct_break = body.supervisor_deduct_break

  const updates: string[] = []
  const values: unknown[] = []
  let i = 1
  if (typeof enhanced_enabled === 'boolean') {
    updates.push(`enhanced_enabled = $${i++}`)
    values.push(enhanced_enabled)
  }
  if (enhanced_start_hour != null && Number.isInteger(enhanced_start_hour) && enhanced_start_hour >= 0 && enhanced_start_hour <= 23) {
    updates.push(`enhanced_start_hour = $${i++}`)
    values.push(enhanced_start_hour)
  }
  if (enhanced_end_hour != null && Number.isInteger(enhanced_end_hour) && enhanced_end_hour >= 0 && enhanced_end_hour <= 23) {
    updates.push(`enhanced_end_hour = $${i++}`)
    values.push(enhanced_end_hour)
  }
  if (typeof break_deduct_enabled === 'boolean') {
    updates.push(`break_deduct_enabled = $${i++}`)
    values.push(break_deduct_enabled)
  }
  if (break_deduct_minutes != null && Number.isFinite(break_deduct_minutes) && break_deduct_minutes >= 0 && break_deduct_minutes <= 120) {
    updates.push(`break_deduct_minutes = $${i++}`)
    values.push(Math.round(break_deduct_minutes))
  }
  if (break_threshold_hours != null && Number.isFinite(break_threshold_hours) && break_threshold_hours >= 0 && break_threshold_hours <= 24) {
    updates.push(`break_threshold_hours = $${i++}`)
    values.push(break_threshold_hours)
  }
  if (typeof supervisor_enabled === 'boolean') {
    updates.push(`supervisor_enabled = $${i++}`)
    values.push(supervisor_enabled)
  }
  if (supervisor_label != null && supervisor_label.length > 0 && supervisor_label.length <= 64) {
    updates.push(`supervisor_label = $${i++}`)
    values.push(supervisor_label)
  }
  if (typeof supervisor_deduct_break === 'boolean') {
    updates.push(`supervisor_deduct_break = $${i++}`)
    values.push(supervisor_deduct_break)
  }
  if (updates.length === 0) {
    res.status(400).json({ error: 'No valid settings to update' })
    return
  }
  values.push(venue.id)
  await query(
    `UPDATE ${DB.VENUES_TABLE}
     SET ${updates.join(', ')}
     WHERE ${DB.ID_COLUMN} = $${i}`,
    values
  )
  const settings = await auth.getVenueSettings(venue.id)
  res.json(settings)
})

router.get('/:slug/export-account-data', requireAdmin, async (req, res) => {
  const slug = String(req.params.slug ?? '').trim()
  const sessionVenueId = req.session?.venue_id
  if (!slug || !sessionVenueId) {
    res.status(400).json({ error: 'Slug required' })
    return
  }
  const venue = await auth.getVenueBySlug(slug)
  if (!venue) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }
  if (venue.id !== sessionVenueId) {
    res.status(403).json({ error: 'Can only export your own venue data' })
    return
  }

  const client = await getClient()
  try {
    const venueRow = await client.query<{
      id: string; slug: string; name: string; active: boolean; created_at: Date
      email_verified: boolean; admin_email: string | null; is_founder: boolean; subscription_tier: string
    }>(
      `SELECT ${DB.ID_COLUMN} AS id, slug, name, active, created_at,
              ${DB.EMAIL_VERIFIED_COLUMN} AS email_verified,
              ${DB.ADMIN_EMAIL_COLUMN} AS admin_email,
              ${DB.IS_FOUNDER_COLUMN} AS is_founder,
              ${DB.SUBSCRIPTION_TIER_COLUMN} AS subscription_tier
       FROM ${DB.VENUES_TABLE} WHERE ${DB.ID_COLUMN} = $1`,
      [venue.id]
    )

    const settings = await auth.getVenueSettings(venue.id)

    const usersRow = await client.query<{
      id: string; username: string; display_name: string; role: string
      standard_rate: number | null; enhanced_rate: number | null; supervisor_rate: number | null
      created_at: Date
    }>(
      `SELECT id, username, display_name, role,
              ${DB.STANDARD_RATE_COLUMN} AS standard_rate,
              ${DB.ENHANCED_RATE_COLUMN} AS enhanced_rate,
              ${DB.SUPERVISOR_RATE_COLUMN} AS supervisor_rate,
              created_at
       FROM ${DB.USERS_TABLE}
       WHERE ${DB.VENUE_ID_COLUMN} = $1
       ORDER BY role, display_name`,
      [venue.id]
    )

    const entriesRow = await client.query<{
      id: string; user_id: string | null; employee: string; clock_in: Date
      clock_out: Date | null; pay_rate_type: string; created_at: Date
    }>(
      `SELECT id, ${DB.USER_ID_COLUMN} AS user_id, employee, clock_in, clock_out,
              ${DB.PAY_RATE_TYPE_COLUMN} AS pay_rate_type, created_at
       FROM ${DB.TIME_ENTRIES_TABLE}
       WHERE ${DB.VENUE_ID_COLUMN} = $1
       ORDER BY clock_in`,
      [venue.id]
    )

    const exportData = {
      venue: venueRow.rows[0],
      settings,
      users: usersRow.rows,
      time_entries: entriesRow.rows,
    }

    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `tythe-export-${slug}-${dateStr}.json`
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Type', 'application/json')
    res.json(exportData)
  } finally {
    client.release()
  }
})

router.post('/:slug/delete-account', requireAdmin, async (req, res) => {
  const slug = String(req.params.slug ?? '').trim()
  const sessionVenueId = req.session?.venue_id
  if (!slug || !sessionVenueId) {
    res.status(400).json({ error: 'Slug required' })
    return
  }
  const venue = await auth.getVenueBySlug(slug)
  if (!venue) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }
  if (venue.id !== sessionVenueId) {
    res.status(403).json({ error: 'Can only delete your own venue' })
    return
  }
  // Founder venue is protected from deletion to prevent accidental loss
  if (venue.is_founder) {
    res.status(403).json({ error: 'The founder venue cannot be deleted' })
    return
  }

  const client = await getClient()
  try {
    await client.query('BEGIN')
    // Delete in FK-safe order: entries first, then users, then venue
    await client.query(
      `DELETE FROM ${DB.TIME_ENTRIES_TABLE} WHERE ${DB.VENUE_ID_COLUMN} = $1`,
      [venue.id]
    )
    await client.query(
      `DELETE FROM ${DB.USERS_TABLE} WHERE ${DB.VENUE_ID_COLUMN} = $1`,
      [venue.id]
    )
    await client.query(
      `DELETE FROM ${DB.VENUES_TABLE} WHERE ${DB.ID_COLUMN} = $1`,
      [venue.id]
    )
    await client.query('COMMIT')
    console.log(`[Venues] delete_account slug=${slug} venueId=${venue.id}`)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Failed to delete venue', error)
    res.status(500).json({ error: 'Failed to delete venue' })
    return
  } finally {
    client.release()
  }

  // Destroy session after successful delete so user cannot continue in app
  req.session.destroy((err) => {
    if (err) {
      console.error('[Venues] session destroy error after delete', err)
    }
    res.json({ ok: true, redirectUrl: '/venues' })
  })
})

router.get('/:slug', async (req, res) => {
  const slug = String(req.params.slug ?? '').trim()
  if (!slug) {
    res.status(400).json({ error: 'Slug required' })
    return
  }
  const venue = await auth.getVenueBySlug(slug)
  if (!venue) {
    res.status(404).json({ error: 'Venue not found' })
    return
  }
  res.json({ slug: venue.slug, name: venue.name })
})

router.post('/', createVenueRateLimit, async (req, res) => {
  const { venueName, username, password, displayName, adminEmail } = parseCreateVenueBody(req.body)

  if (!venueName || !username || !password || !displayName || !adminEmail) {
    res
      .status(400)
      .json({ error: 'Venue name, admin email, username, password, and display name are required' })
    return
  }

  const slug = slugifyVenueName(venueName)
  if (!slug) {
    res.status(400).json({ error: 'Venue name must contain letters or numbers' })
    return
  }

  const client = await getClient()
  try {
    await client.query('BEGIN')

    /*
     * Tythe Barn is the founding test partner.
     * This venue is permanently exempt from verification and subscription restrictions.
     * Do not remove or alter without founder approval.
     */
    const isFounder = slug === 'tythebarn'
    const emailVerified = isFounder // Founder is pre-verified
    const subscriptionTier = isFounder ? 'FOUNDER' : 'FREE'
    
    let token: string | null = null
    let tokenHash: string | null = null
    
    if (!isFounder) {
      token = emailService.generateToken()
      tokenHash = await emailService.hashToken(token)
    }

    if (isFounder) {
      console.log(`[Venues] founder_bypass_used slug=${slug}`)
    }

    const venueInsert = await client.query<{ id: string; slug: string; name: string }>(
      `INSERT INTO ${DB.VENUES_TABLE} 
       (slug, name, ${DB.IS_FOUNDER_COLUMN}, ${DB.EMAIL_VERIFIED_COLUMN}, ${DB.SUBSCRIPTION_TIER_COLUMN}, ${DB.ADMIN_EMAIL_COLUMN}, ${DB.VERIFICATION_TOKEN_HASH_COLUMN}, ${DB.VERIFICATION_SENT_AT_COLUMN})
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${DB.ID_COLUMN}, slug, name`,
      [slug, venueName, isFounder, emailVerified, subscriptionTier, adminEmail, tokenHash, tokenHash ? new Date() : null]
    )

    const venue = venueInsert.rows[0]
    await client.query(
      `INSERT INTO ${DB.USERS_TABLE}
       (username, password_hash, role, display_name, ${DB.VENUE_ID_COLUMN})
       VALUES ($1, $2, 'admin', $3, $4)`,
      [username, hashPassword(password), displayName, venue.id]
    )

    await client.query('COMMIT')

    // Send email AFTER commit to ensure DB is ready
    let emailSent = true
    let emailErrorMsg: string | undefined
    if (!isFounder && token) {
      try {
        await emailService.sendVerificationEmail(adminEmail, venueName, token)
      } catch (emailError) {
        console.error('Failed to send verification email on signup', emailError)
        emailSent = false
        emailErrorMsg = emailError instanceof Error ? emailError.message : String(emailError)
      }
    }

    res.status(201).json({
      redirectUrl: isFounder ? `/${venue.slug}/login` : `/verify-email-pending?venueId=${venue.id}`,
      venue: { slug: venue.slug, name: venue.name },
      warning: emailSent ? undefined : `Venue created but verification email could not be sent: ${emailErrorMsg}. Please check SMTP configuration or try resending from the login page.`,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: 'Venue slug or username already exists' })
      return
    }
    console.error('Failed to create venue', error)
    res.status(500).json({ error: 'Failed to create venue' })
  } finally {
    client.release()
  }
})

export default router
