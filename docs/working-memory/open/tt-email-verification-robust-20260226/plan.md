# Task: tt-email-verification-robust-20260226

> **Goal**: Make email verification robust, auto-login after signup, add resend from manager dashboard, and handle everything that can go wrong.

## Prerequisites

- tt-verification-fallback-20260226 (unverified can login, manager disabled until verified)
- tt-email-verification-20260226 (base verification flow)

## What Could Go Wrong (Failure Analysis)

### Email never sends
| Cause | Detection | Mitigation |
|-------|-----------|------------|
| SMTP not configured (local dev) | `!SMTP_USER \|\| !SMTP_PASS` | Log verification link to console; user can copy-paste |
| SMTP auth failure | Nodemailer error | Log error code; return 500 with "Email service unavailable" on resend |
| Wrong APP_BASE_URL | Link 404s when clicked | Validate APP_BASE_URL format on startup; log warning |
| Invalid admin_email | Nodemailer bounce | Validate email format before send; log send failures |
| Rate limit (5/hour) | resendVerificationEmail returns early | Return 429 with "Try again in X minutes" when authenticated |
| Network/DNS failure | Nodemailer timeout | Retry (already 3x); log; return 500 on resend |

### User never receives
| Cause | Mitigation |
|-------|------------|
| Spam folder | Email copy: "Check spam"; add plain-text fallback |
| Wrong email typo | Allow resend from dashboard; consider "change email" for unverified |
| Email provider blocks | Document SMTP setup; SPF/DKIM in docs |

### User can't complete verification
| Cause | Mitigation |
|-------|------------|
| Token expired (24h) | Resend generates new token; show "Link expired? Resend" |
| Closed browser, lost link | Resend from dashboard or verify-email-pending |
| Link malformed | Validate APP_BASE_URL; ensure no trailing slash issues |
| CORS / same-origin | Verification is GET; should work |

### Signup UX
| Current | Desired |
|---------|---------|
| Redirect to verify-email-pending (not logged in) | Auto-login, redirect to dashboard |
| User must manually login | User lands in dashboard immediately |
| No way to resend from dashboard | Resend button in unverified banner |

## Stories (order matters)

1. **evr-01-auto-login-signup** — After venue create (non-founder): client calls auth.login with the credentials from the form, then redirects to dashboard (`/clock` or `/`). Do NOT redirect to verify-email-pending. User lands in app logged in. If verification-fallback is done, they see banner + disabled manager.
2. **evr-02-resend-from-dashboard** — Add "Resend verification email" button to the unverified banner (Layout or wherever banner lives). When clicked, POST to resend. Show success ("Check your email") or error ("Failed to send. Check SMTP config."). Requires auth.
3. **evr-03-resend-auth-optional** — Resend endpoint: if req.session has user + venue_id, use venue_id from session (no body required). If unauthenticated, require venueId in body (for verify-email-pending). Both paths work.
4. **evr-04-resend-rate-limit-feedback** — When resend hits rate limit (5/hour): return 429 with `{ error, retryAfterMinutes }`. Client shows "You can resend again in X minutes." resendVerificationEmail must return this info (or a new endpoint that checks before sending).
5. **evr-05-email-diagnostics** — When SMTP send fails: log `[EmailService] verification_email_failed to=X reason=Y`. When SMTP not configured: log link clearly at INFO level. Consider startup check: if APP_BASE_URL looks wrong (localhost in prod?), log warning.
6. **evr-06-verify-pending-ux** — VerifyPendingPage: keep for users who arrive via direct link (e.g. email link before login). Add "Already have an account? Log in" link. Ensure resend works without auth (venueId in body).
7. **evr-07-edge-cases-doc** — Add docs/email-verification-troubleshooting.md: SMTP not configured, wrong APP_BASE_URL, rate limit, token expired, spam folder. One-liner in README pointing to it.
8. **evr-08-verify** — npm run build. Full flow: signup → auto-login → dashboard with banner → resend from dashboard → verify → manager enabled.

## Key Paths

- `tt-ts/src/client/pages/VenueLandingPage.tsx` — after create, call login, redirect to dashboard
- `tt-ts/src/client/pages/Layout.tsx` or banner component — resend button
- `tt-ts/src/server/routes/venues.ts` — resend: support session-based venueId
- `tt-ts/src/server/services/emailService.ts` — resendVerificationEmail return rate-limit info; better logging
- `tt-ts/src/client/api.ts` — venues.create response; auth.login
- `docs/email-verification-troubleshooting.md` — new doc

## Verification

```bash
cd tt-ts && npm run build
./ralph/verify-tt-email-verification-robust-20260226.sh
```
