# Task: tt-security-recommendations-20260223

> Created: 2026-02-23 | Status: in progress
> Goal: Implement PASTA security recommendations from docs/security/PASTA-analysis.md

## Summary

Implement the actionable mitigations from the PASTA threat model. Source: `docs/security/PASTA-analysis.md` Phase 7.

## Stories (one per iteration)

### Immediate (high impact)

**sec-01: Enforce SESSION_SECRET in production**
- Fail server startup if `SESSION_SECRET` is missing in production (`NODE_ENV=production`).
- Update `tt-ts/src/server/index.ts` — no fallback to dev secret when production.
- Add to .env.example and README.

**sec-02: Harden session cookie and regenerate on login**
- Add `sameSite: 'lax'` to session cookie config (`tt-ts/src/server/index.ts`).
- Regenerate session ID on login before storing user (`req.session.regenerate()` then assign user) in `tt-ts/src/server/routes/auth.ts`.
- Ensure logout clears cookie (destroy + clear cookie).

**sec-03: Rate limit auth endpoints**
- Add rate limiting to `POST /api/auth/login`, `POST /api/auth/change-password`, `POST /api/auth/first-setup`, `POST /api/users/:id/reset-password`.
- Use `express-rate-limit` or similar. Config: e.g. 5 req/15min per IP for login.
- Apply to auth routes in `tt-ts/src/server/`.

**sec-04: CSRF protection for state-changing routes**
- Add CSRF token middleware (synchronizer token or double-submit).
- At minimum: set `sameSite: 'lax'` (sec-02) and add Origin/Referer check for POST/PUT/DELETE.
- Protect `/api/users`, `/api/shifts`, `/api/auth/change-password`, etc.

**sec-05: Validate payroll inputs**
- `/:id/pay-rates`: validate numbers (or null), reject negatives, enforce max (e.g. 999.99).
- `shifts` routes: validate dates (`!isNaN(date.getTime())`), clock_out >= clock_in, `payRateOverride` enum (Standard|Enhanced|Supervisor).
- `tt-ts/src/server/routes/users.ts`, `tt-ts/src/server/routes/shifts.ts`, `tt-ts/src/server/auth/index.ts`.

**sec-06: Audit-log payroll and user changes**
- Log pay-rate changes, user role changes, activation/deactivation, password resets, promote-admin, first-setup.
- Extend `tt-ts/src/server/audit.ts` and call from auth/users routes.
- Include actor, target user ID, before/after (no secrets).

### Near term

**sec-07: Split RBAC for payroll (admin-only pay rates)**
- Restrict `/:id/pay-rates` and `GET /api/users` pay fields to admin only (or new `can_manage_pay_rates`).
- Add `requireAdmin` middleware; managers lose pay-rate write access.
- `tt-ts/src/server/middleware/auth.ts`, `tt-ts/src/server/routes/users.ts`.

**sec-08: Migrate time entries to user_id**
- Add `user_id` to time_entries; use for queries/exports instead of display_name.
- Migration script; update repository, exportService, clock routes.
- Larger change — may span multiple iterations.

**sec-09: Production session store**
- Replace MemoryStore with Redis or connect-pg-simple (Postgres).
- Configurable via env (SESSION_STORE=memory|redis|pg).

### Medium term

**sec-10: DB TLS certificate validation**
- Add env `DB_SSL_REJECT_UNAUTHORIZED=true` for production; use in `tt-ts/src/server/db/connection.ts`.
- Default `rejectUnauthorized: false` for Supabase pooler compatibility; document when to enable.

**sec-11: First-setup token**
- Require setup token or out-of-band confirmation for `/api/auth/first-setup`.
- Env `FIRST_SETUP_TOKEN`; reject if not provided when table empty.

## Verification

```bash
cd tt-ts && npm run build
```

Per-story: manual or script checks (e.g. rate limit returns 429, SESSION_SECRET missing fails startup in prod).

## Rules

- One story per iteration; commit after each.
- Conventional commits: `fix(tt-ts):` or `feat(tt-ts):` for security.
- Update `docs/working-memory/open/tt-security-recommendations-20260223/updates.md` when done.
- Do NOT break existing functionality.
