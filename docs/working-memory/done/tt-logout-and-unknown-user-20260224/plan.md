# Task: tt-logout-and-unknown-user-20260224

## Goal

1. **Logout** — After logout, user lands on /login and stays there (no "Unknown user" flash).
2. **Unknown user** — Reject incomplete users at login and in getAuthUserById.

## Root Cause

Logout was redirecting to /login but the session cookie was not being cleared on Netlify, so /me still returned the user. Likely causes: clearCookie options mismatch (secure/path), redirect race (browser hadn't processed Set-Cookie), or NODE_ENV mismatch at runtime.

## Implementation Phases

### Phase 1: Harden Logout (Server)

- `tt-ts/src/server/sessionConfig.ts` — shared cookie options
- `tt-ts/src/server/index.ts` — use getSessionCookieOptions for session
- `tt-ts/src/server/routes/auth.ts` — use getSessionCookieOptions for clearCookie; clear with both secure:true and secure:false when in prod to cover env mismatch

### Phase 2: Harden Logout (Client)

- `tt-ts/src/client/pages/Layout.tsx` — 150ms delay after logout before window.location.href = '/login'

### Phase 3: Reject Incomplete Users

- `tt-ts/src/server/auth/index.ts` — authenticateUser: reject if display_name or username empty (same as getAuthUserById)

### Phase 4: Verification

- `tt-ts/scripts/verify-logout-flow.sh` — run server, run curl login→me→logout→me, assert 401 on final /me
- Optional: VERIFY_LOGIN_USER, VERIFY_LOGIN_PASSWORD when DB has existing users

### Phase 5: Ralph Artifacts

- This plan, prompt, verify script

## Verification

- `./tt-ts/scripts/verify-logout-flow.sh` — passes when logout clears session
- `./ralph/verify-tt-logout-and-unknown-user-20260224.sh` — runs verify-logout-flow + static checks + build
- Manual: log in, log out, confirm /login and no connect.sid cookie
