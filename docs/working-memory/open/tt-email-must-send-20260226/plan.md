# Task: tt-email-must-send-20260226

> **Goal**: Emails MUST send. Non-negotiable. They were working yesterday — find what broke and fix it.

## Problem

Verification emails are not being sent. The app must send emails. Something changed.

## What May Have Broken

1. **Dev fallback swallowing failures** — When SMTP fails in dev, we return success instead of throwing. This hides real failures. Revert: always throw when send fails; never return fake success.
2. **Rate limit using audit_log** — Resend rate limit queries `audit_log` for `event = 'verification_email_sent'`. If that table/schema is wrong, the query could fail or block incorrectly.
3. **Env loading** — SMTP_USER, SMTP_PASS not loaded (dotenv order, Secret Manager in prod).
4. **SMTP config** — Wrong host (smtp.gmail.com vs smtp-relay.gmail.com), port, or auth.
5. **insertAuditLog before send** — We insert audit log before sending. If insertAuditLog throws, we never reach send. Or the insert could change flow.

## Stories (order matters)

1. **ems-01-revert-dev-fallback** — Remove the dev fallback that returns success when SMTP fails. When sendVerificationEmail throws, ALWAYS rethrow. Never return linkLoggedToConsole. User must see real failure.
2. **ems-02-smtp-startup-check** — On server startup, if SMTP_USER and SMTP_PASS are set, log "[EmailService] SMTP configured: host=X port=Y". If not set, log "[EmailService] SMTP NOT configured — set SMTP_USER and SMTP_PASS in .env". No silent failures.
3. **ems-03-rate-limit-robust** — Rate limit for resend: if audit_log query fails, log and allow send (fail open for rate limit, not for send). Ensure audit_log has correct schema for the query. Consider falling back to verification_sent_at on venues if audit_log is unreliable.
4. **ems-04-signup-send** — On venue signup: if sendVerificationEmail throws, do NOT swallow. Log the error. Return 500 or 201 with a warning. User must know email failed. Document: check SMTP config.
5. **ems-05-verify** — npm run build. Manual test: with valid SMTP in .env, signup and resend both deliver emails. Without SMTP, clear error (no fake success).

## Key Paths

- `tt-ts/src/server/services/emailService.ts` — revert dev fallback, startup log
- `tt-ts/src/server/routes/venues.ts` — signup error handling, resend error handling
- `tt-ts/src/server/db/repository.ts` — insertAuditLog
- `docs/google-email-setup.md` — ensure setup instructions are correct

## Verification

```bash
cd tt-ts && npm run build
./ralph/verify-tt-email-must-send-20260226.sh
# With SMTP in .env: create venue, resend — both must deliver email
# Without SMTP: must show error, never fake success
```
