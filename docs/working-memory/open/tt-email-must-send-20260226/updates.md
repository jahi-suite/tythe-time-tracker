# tt-email-must-send-20260226 — Updates

## Progress

- **ems-01-revert-dev-fallback** (DONE) — Removed the dev fallback that returned success when SMTP failed. `sendVerificationEmail` now throws if SMTP is not configured or if sending fails. `resendVerificationEmail` rethrows these errors.
- **ems-02-smtp-startup-check** (DONE) — Added SMTP configuration logging on server startup to `emailService.ts`.
- **ems-03-rate-limit-robust** (DONE) — Made the resend rate limit more robust by wrapping the `audit_log` query in a `try-catch` block and failing open (with a fallback to `verification_sent_at` from the `venues` table).
- **ems-04-signup-send** (DONE) — On venue signup, the app now returns a warning if `sendVerificationEmail` fails, ensuring users are aware of the failure.
- **ems-05-verify** (DONE) — Build and verification script passed. No dev fallback, SMTP startup log present, and `resendVerificationEmail` rethrows SMTP failures.

## Context

Emails were working yesterday. App must send emails — non-negotiable. Find what broke and fix it.
