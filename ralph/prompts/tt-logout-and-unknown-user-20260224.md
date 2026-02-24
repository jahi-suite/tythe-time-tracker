You are a Ralph execution agent. Fix logout session persistence and unknown-user rejection. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-logout-and-unknown-user-20260224/plan.md
- tt-ts/src/server/routes/auth.ts
- tt-ts/src/server/sessionConfig.ts
- tt-ts/src/client/pages/Layout.tsx
- tt-ts/src/server/auth/index.ts
- tt-ts/scripts/verify-logout-flow.sh

## Task

### Phase 1: Harden logout server-side

1. Ensure `tt-ts/src/server/sessionConfig.ts` exports `getSessionCookieOptions()` with path, httpOnly, sameSite, secure (from NODE_ENV).
2. In `auth.ts` logout handler: use getSessionCookieOptions for clearCookie. Clear with both secure:true and secure:false when opts.secure is true (covers Netlify NODE_ENV mismatch).
3. Add comment: must not send response until destroy completes.

### Phase 2: Harden logout client-side

In Layout.tsx handleLogout: after `await logout()`, add `await new Promise((r) => setTimeout(r, 150))` before `window.location.href = '/login'`.

### Phase 3: Reject incomplete users at login

In `authenticateUser` (auth/index.ts): add `if (!row.display_name?.trim() || !row.username?.trim()) return null` before returning the user.

### Phase 4: Verification script

Ensure `tt-ts/scripts/verify-logout-flow.sh` exists and:
- Builds, starts server on PORT (default 3847), waits for /api/health
- If first-setup needsSetup, creates verify-test user
- Login, GET /me (200), POST logout, GET /me (401)
- Exits 0 only if final /me returns 401

### Phase 5: Ralph verify script

Ensure `ralph/verify-tt-logout-and-unknown-user-20260224.sh`:
- Runs tt-ts/scripts/verify-logout-flow.sh
- Runs npm run build in tt-ts
- Static checks: Layout redirect, getAuthUserById ||, authenticateUser ||

## Verify

- Run ./ralph/verify-tt-logout-and-unknown-user-20260224.sh
- Do NOT skip verification. The verify script must pass.

## Rules

- Conventional commit: `fix: harden logout session clear and reject incomplete users`
- Update docs/working-memory/open/tt-logout-and-unknown-user-20260224/updates.md
