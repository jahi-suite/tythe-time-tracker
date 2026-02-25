# Task: tt-login-auth-diagnosis-20260224

> Created: 2026-02-24 | Status: open
> **Root problem**: "Unknown user" persists; user says "we clearly are not logging in correctly."

## Goal

**Step back and diagnose the actual login/auth failure.** Previous fixes (COALESCE, Layout fallback, migration) assumed display-name fallbacks. The real issue may be: session not persisting, cookie not set/sent, or auth.me() failing on production.

## IMPORTANT: Agent Rules

- **Ralph does ALL coding** — the planning agent creates the plan; Ralph implements it.
- **User runs verify scripts** — the agent must NOT run `./ralph/verify-*.sh` or `./tt-ts/scripts/verify-*.sh`. Those are for the user to run in their terminal.
- One atomic change per iteration; commit after each.

---

## Full Login Flow (Trace)

### 1. Initial load (no session)

1. `AuthProvider` mounts → `refresh()` → `auth.me()` → GET `/api/auth/me`
2. No session cookie → `req.session?.user` is undefined → 401
3. `setUser(null)` → user sees login page or first-setup

### 2. Login

1. User submits form → `auth.login(username, password)` → POST `/api/auth/login`
2. Server: `authenticateUser()` → DB lookup, COALESCE display_name
3. Server: `req.session.regenerate()` → `req.session.user = user` → `res.json(user)`
4. **Session save**: express-session saves asynchronously when response ends
5. Client: `setUser(u)` with response body
6. **Cookie**: Set-Cookie `connect.sid=...` in response (if session middleware runs)

### 3. Post-login (same tab, no refresh)

1. User has `user` from login response — no `auth.me()` call
2. App shows Layout with `displayName` from `user`

### 4. Page refresh or new request

1. `AuthProvider` mounts → `refresh()` → `auth.me()` → GET `/api/auth/me`
2. Browser sends `Cookie: connect.sid=...` (if credentials: 'include')
3. Server loads session from store (memory/pg/redis)
4. If session found: `getAuthUserById(sessionUser.id)` → return fresh user
5. If no session: 401 → `setUser(null)` → login page

---

## Failure Modes (Hypotheses)

| # | Hypothesis | Symptom | How to verify |
|---|------------|---------|---------------|
| A | **Session store is memory on Netlify** | Each serverless invocation has its own memory; session from login is lost on next request | Check Netlify env: `SESSION_STORE` must be `pg` (or redis). Default in prod is `pg` if NODE_ENV=production. |
| B | **Session not saved before next request** | Login response sent; session save is async; client navigates fast; /me hits before save | Add explicit session save callback or ensure response doesn't flush before save |
| C | **Cookie not set or not sent** | Set-Cookie missing, wrong domain, SameSite, Secure mismatch | Check response headers; verify cookie in DevTools |
| D | **getAuthUserById returns null** | User deleted/deactivated between login and /me | Unlikely if same request flow |
| E | **AuthContext rejects user** | User has empty display_name+username; refresh() force-logs out | Would show login page, not "Unknown user" |
| F | **Stale "Unknown user" in other components** | Layout fixed to 'User', but ClockPage/TimesheetPage/ExportPage/ManagerPage still have "Unknown user" | grep for "Unknown user" |

---

## Implementation Plan

### Phase 1: Ensure SESSION_STORE on Netlify (Ralph)

- Add `SESSION_STORE=pg` to `tt-ts/netlify-env.template` and `docs/NETLIFY_ENV_SETUP.md`
- **Critical**: Without pg/redis, serverless uses memory and sessions are lost between invocations

### Phase 2: Await session save on login (Ralph)

- In `tt-ts/src/server/routes/auth.ts` login handler: wrap `res.json(user)` in a callback that runs after session is saved
- express-session: use `req.session.save((err) => { if (err) ...; else res.json(user); })` instead of calling `res.json(user)` directly in regenerate callback
- This ensures the session is persisted before the client gets the response

### Phase 3: Remove all "Unknown user" fallbacks (Ralph)

- grep for "Unknown user" and replace with "User" in: ClockPage, TimesheetPage, ExportPage, ManagerPage
- Ensures consistent fallback even if user object is malformed

### Phase 4: Add diagnostic endpoint (optional, Ralph)

- GET `/api/auth/debug` (or /health with extra info when SESSION_DEBUG=1): returns `{ sessionId: boolean, hasUser: boolean, store: string }` — helps verify session is present
- Only when `SESSION_DEBUG=1` in env; do not expose in production by default

### Phase 5: Verification script (Ralph creates; USER runs)

- Script that: starts server with SESSION_STORE=memory, curls login→me→logout→me, asserts 401 on final /me
- Script that: greps for "Unknown user" (should be 0)
- **Agent must NOT run these** — user runs them

---

## Key Files

- `tt-ts/src/server/routes/auth.ts` — login, logout, /me
- `tt-ts/src/server/auth/index.ts` — authenticateUser, getAuthUserById
- `tt-ts/src/server/index.ts` — session store selection
- `tt-ts/src/server/sessionConfig.ts` — cookie options
- `tt-ts/netlify-env.template` — Netlify env template
- `docs/NETLIFY_ENV_SETUP.md` — setup docs
- `tt-ts/src/client/pages/Layout.tsx` — sidebar display
- `tt-ts/src/client/pages/ClockPage.tsx`, TimesheetPage, ExportPage, ManagerPage — "Unknown user" fallbacks
- `tt-ts/src/client/context/AuthContext.tsx` — refresh, login, user state

---

## Verification (User runs these)

```bash
# After Ralph implements:
./ralph/verify-tt-login-auth-diagnosis-20260224.sh
```

Manual: Deploy to Netlify, log in, refresh page — user should stay logged in. Check Netlify env has SESSION_STORE=pg and NODE_ENV=production.
