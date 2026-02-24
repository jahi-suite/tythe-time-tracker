# Task: tt-netlify-login-debug-20260224

## Goal

Add diagnostic tooling to debug Netlify login failures. Login still fails on production; we need visibility into DB, session store, and request context without exposing secrets.

## Key File

- tt-ts/src/server/index.ts
- tt-ts/src/server/routes/auth.ts

## Verification

```bash
./ralph/verify-tt-netlify-login-debug-20260224.sh
```

## Implementation

### 1. Add /api/debug endpoint (GET only, no auth)

Returns JSON with non-sensitive diagnostics:

- `env`: `{ hasSupabaseHost, hasSessionSecret, nodeEnv, supabasePort }` — presence/values for troubleshooting (no passwords)
- `session`: `{ store: 'memory'|'pg'|'redis', cookieSecure, cookieSameSite }`
- `request`: `{ protocol, host, origin, forwardedProto }` — from req, to verify proxy/CSRF

Place before requireSameOriginForMutations (GET is allowed through). Do NOT return secrets.

### 2. Add structured logging in login route

In auth.ts POST /login:

- Log `[login] attempt username=${username}` (no password)
- On auth fail: `[login] auth failed username=${username}`
- On session.regenerate err: `[login] session regenerate failed username=${username} err=${err.message}`
- On success: `[login] success username=${username}`

Use `console.error` so it appears in Netlify function logs.

### 3. Optional: /api/debug/session-ping

GET endpoint that sets a minimal session flag and returns `{ ok: true }`. A follow-up GET with same cookie would confirm cookie persistence. Only enable in development or behind a DEBUG_SESSION_PING env flag.

## Success Criteria

- /api/debug returns valid JSON with env, session, request
- Login route has the four log points
- npm run build succeeds
- Verify script passes
