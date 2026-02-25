# Task: tt-email-verification-20260226

> **Goal**: Mandatory email verification for new venues. Google Workspace SMTP. Tythe Barn (tythebarn) is the founding test partner and permanently exempt.

## Objective

- Every new venue must verify their email before accessing the dashboard
- Verification emails sent via Google Workspace SMTP Relay
- Infrastructure within Google ecosystem (Cloud Run, Secret Manager, Cloud Logging)
- **Tythe Barn** (slug `tythebarn`) is founder-exempt: no verification, no subscription limits, permanent free access

## Founder Rule (Tythe Barn)

```
Tythe Barn is the founding test partner.
This venue is permanently exempt from verification and subscription restrictions.
Do not remove or alter without founder approval.
```

If `venue.slug === "tythebarn"`:
- `is_founder = TRUE`
- `email_verified = TRUE`
- `subscription_tier = 'FOUNDER'`
- Never blocked, never payment gated, always full access

## Database Migration

Add to `venues` table:

| Column | Type | Default |
|--------|------|---------|
| email_verified | BOOLEAN | FALSE |
| verification_token_hash | TEXT | NULL |
| verification_sent_at | TIMESTAMPTZ | NULL |
| is_founder | BOOLEAN | FALSE |
| subscription_tier | TEXT | 'FREE' |
| admin_email | TEXT | NULL |

Migration must:
- Add columns
- Set `tythebarn` venue: `is_founder=TRUE`, `email_verified=TRUE`, `subscription_tier='FOUNDER'`
- Seed tythebarn if missing

## Key Paths

- `tt-ts/src/server/db/migrate.ts` — migration
- `tt-ts/src/server/services/emailService.ts` — new EmailService
- `tt-ts/src/server/routes/venues.ts` — signup flow, verification endpoints
- `tt-ts/src/server/middleware/` — access gate
- `tt-ts/src/client/pages/` — VerifyPendingPage, VerifyEmailPage
- `docs/google-email-setup.md` — Google Workspace SMTP doc
- `docs/secret-manager-setup.md` — Secret Manager doc

## Stories (order matters)

1. **ev-01-migration** — DB migration: add email_verified, verification_token_hash, verification_sent_at, is_founder, subscription_tier, admin_email. Seed tythebarn with founder flags.
2. **ev-02-founder-logic** — Founder rule: if slug=tythebarn then is_founder=true, email_verified=true, subscription_tier=FOUNDER. Add code comment. Apply in migration and runtime checks.
3. **ev-03-email-service** — Create EmailService: sendVerificationEmail(venueEmail, venueName, token), resendVerificationEmail(venueId). SMTP via nodemailer. 3 retries, exponential backoff. Rate limit resend (5/hour). Anti-enumeration (never reveal if account exists).
4. **ev-04-secrets** — Document Secret Manager: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, APP_BASE_URL. Code reads from env (injected by Cloud Run).
5. **ev-05-signup-flow** — On venue create: if founder → mark verified, skip email. Else: generate token, hash, store, send email, set email_verified=false. Require admin_email in create body.
6. **ev-06-verification-route** — GET /verify-email?token=XYZ: hash token, constant-time compare, check 24h expiry. If valid: set email_verified=true, clear token, redirect dashboard. If invalid: error page + resend option.
7. **ev-07-access-gate** — Middleware: if is_founder → allow. Else if !email_verified → redirect /verify-email-pending. Else allow.
8. **ev-08-ui-pages** — VerifyPendingPage, VerifyEmailPage (expired), ResendConfirmationPage. Clean UI matching app theme.
9. **ev-09-logging** — Cloud Logging events: verification_email_sent, verification_email_failed, verification_success, verification_failed, resend_requested, founder_bypass_used.
10. **ev-10-docs** — docs/google-email-setup.md (Workspace SMTP Relay), docs/secret-manager-setup.md.
11. **ev-11-tests** — Tests: normal signup blocked until verified; founder never blocked; expired token; token reuse rejected; dashboard access without verification blocked; resend rate limit; SMTP retry.
12. **ev-12-verify** — npm run build passes. Full flow works. Founder bypass works.

## Verification

```bash
cd tt-ts && npm run build
./ralph/verify-tt-email-verification-20260226.sh
```

## Security

- Token stored hashed (bcrypt or crypto.scrypt)
- Constant-time comparison
- 24h expiry
- Resend rate limit (5/hour)
- No token reuse
- HTTPS required
- Anti-enumeration on resend

## Email Content

Subject: `Verify your venue to activate KariSuite`
Link: `{APP_BASE_URL}/verify-email?token={token}`
Expiry: 24 hours
