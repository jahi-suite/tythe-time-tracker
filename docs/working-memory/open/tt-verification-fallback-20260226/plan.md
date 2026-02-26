# Task: tt-verification-fallback-20260226

> **Goal**: When a venue doesn't verify or can't verify, allow them to log in and use basic features (clock, timesheet) but block staff management (add user, edit user, shifts, export, audit) until verified.

## Context

Email verification (tt-email-verification-20260226) is complete. Currently, unverified venues are fully blocked: they cannot access the dashboard at all. This creates a poor UX when:
- Email never arrives (SMTP misconfiguration, spam)
- User misses the 24h window
- User wants to try the app before verifying

## Fallback Strategy

**Primary approach**: Allow unverified venues to log in and use read-only / self-service features. Block manager actions until verified.

| Allowed (unverified) | Blocked (unverified) |
|---------------------|----------------------|
| Login | Add user |
| Clock in/out (own) | Edit user |
| View own timesheet | Delete user |
| Change own password | Activate/deactivate user |
| View dashboard | Promote to admin |
| | Add/edit/delete shifts |
| | Export (manager) |
| | Audit log |
| | Set pay rates |

Tythe Barn (founder) remains exempt: full access regardless.

## Key Paths

- `tt-ts/src/server/middleware/verification.ts` — refactor requireEmailVerified
- `tt-ts/src/server/index.ts` — route ordering, apply verification only to manager routes
- `tt-ts/src/server/routes/users.ts` — require verified for create/update/delete/activate/deactivate/promote/reset
- `tt-ts/src/server/routes/shifts.ts` — require verified for add/edit/delete
- `tt-ts/src/server/routes/export.ts` — require verified for manager export
- `tt-ts/src/server/routes/audit.ts` — require verified
- `tt-ts/src/server/routes/auth.ts` — include email_verified in /me response
- `tt-ts/src/client/` — banner, disable Add User / Manage Users / shifts / export for unverified

## Stories (order matters)

1. **vf-01-middleware-refactor** — Refactor requireEmailVerified: allow unverified through (don't block, don't redirect). Add requireEmailVerifiedForManager middleware that returns 403 for unverified on manager routes. Apply requireEmailVerifiedForManager only to users, shifts, export, audit. Remove global block and HTML redirect.
2. **vf-02-auth-me-flag** — Include `email_verified` in /api/auth/me response (venue object). Client needs this to show banner and disable UI.
3. **vf-03-client-banner** — Show "Verify your email to add staff and manage shifts" banner on dashboard when unverified. Disable/hide: Add User form, Manage Users tab content, shift add/edit/delete, export for managers. Employee view (clock, own timesheet) remains usable.
4. **vf-04-verify** — npm run build passes. verify script passes. Unverified can login, clock, view timesheet; cannot add user; banner visible.

## Verification

```bash
cd tt-ts && npm run build
./ralph/verify-tt-verification-fallback-20260226.sh
```

## Security

- Manager routes (users, shifts, export, audit) must enforce verification server-side. Never trust client-only checks.
- Founder (tythebarn) exempt in all checks.
