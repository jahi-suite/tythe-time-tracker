# tt-email-verification-20260226 — Updates

## Progress

- 2026-02-26: Completed ev-01-migration. Added email verification and founder columns to venues table, updated shared types and constants, and seeded tythebarn with founder flags.
- 2026-02-26: Completed ev-02-founder-logic. Applied founder rule for tythebarn in venue creation and retrieval, and added mandatory code comments.
- 2026-02-26: Completed ev-03-email-service. Created EmailService using nodemailer with SMTP relay, implementing 3 retries with exponential backoff, resend rate limiting (5/hour), and anti-enumeration. Installed nodemailer and @types/nodemailer.

