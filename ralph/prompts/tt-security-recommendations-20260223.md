You are a Ralph Wiggum execution agent implementing PASTA security recommendations for the Tythe Barn Employee Portal. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read:
- `docs/working-memory/open/tt-security-recommendations-20260223/plan.md`
- `docs/working-memory/open/tt-security-recommendations-20260223/updates.md`
- `docs/security/PASTA-analysis.md` (Phase 7 — actionable mitigations)

## Task

Implement the **next uncompleted story** from the plan. Do ONE story per iteration.

**Check updates.md** to see what's done. Pick the next sec-XX story in order (sec-01, sec-02, ...).

**Reference implementations in PASTA:**
- sec-01: `tt-ts/src/server/index.ts` line 25 — require SESSION_SECRET in production
- sec-02: session cookie sameSite, req.session.regenerate() on login, logout cookie clear
- sec-03: express-rate-limit on auth routes
- sec-04: CSRF token or Origin check on mutating routes
- sec-05: pay-rates validation (numbers, range), shifts date/payRateOverride validation
- sec-06: audit log for pay-rate changes, user role/activation/reset/promote, first-setup
- sec-07: requireAdmin for pay-rates; managers cannot set pay rates
- sec-08: user_id on time_entries (larger migration)
- sec-09: Redis or connect-pg-simple session store
- sec-10: DB_SSL_REJECT_UNAUTHORIZED env
- sec-11: FIRST_SETUP_TOKEN for first-setup endpoint

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: `fix(tt-ts):` or `feat(tt-ts):` for security
- Do NOT break existing functionality. Run `cd tt-ts && npm run build` to verify.
- Update `docs/working-memory/open/tt-security-recommendations-20260223/updates.md` when done.
