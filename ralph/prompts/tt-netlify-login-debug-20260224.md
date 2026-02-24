You are a Ralph execution agent adding Netlify login debug tooling. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-netlify-login-debug-20260224/plan.md
- tt-ts/src/server/index.ts
- tt-ts/src/server/routes/auth.ts

## Task

### 1. Add GET /api/debug endpoint

In tt-ts/src/server/index.ts, add a GET /api/debug route (before requireSameOriginForMutations, since GET passes through). Return JSON:

```json
{
  "env": {
    "hasSupabaseHost": true,
    "hasSessionSecret": true,
    "nodeEnv": "production",
    "supabasePort": 6543
  },
  "session": {
    "store": "pg",
    "cookieSecure": true,
    "cookieSameSite": "lax"
  },
  "request": {
    "protocol": "https",
    "host": "example.netlify.app",
    "origin": "https://example.netlify.app",
    "forwardedProto": "https"
  }
}
```

- env: use !!process.env.SUPABASE_HOST, !!process.env.SESSION_SECRET, process.env.NODE_ENV, parseInt(process.env.SUPABASE_PORT, 10) or 0
- session: store = SESSION_STORE or (isProduction ? 'pg' : 'memory'), cookieSecure = NODE_ENV==='production', cookieSameSite = 'lax'
- request: from req.protocol, req.get('host'), req.get('origin'), req.get('x-forwarded-proto')

Do NOT return passwords or secrets.

### 2. Add login logging in auth.ts

In tt-ts/src/server/routes/auth.ts, POST /login handler:

- At start (after rate limit): `console.error('[login] attempt username=', username)`
- After auth.authenticateUser, if !user: `console.error('[login] auth failed username=', username)`
- In session.regenerate callback, if err: `console.error('[login] session regenerate failed username=', username, 'err=', err?.message)`
- On success (before res.json): `console.error('[login] success username=', username)`

Never log passwords.

### 3. Verify

- Run ./ralph/verify-tt-netlify-login-debug-20260224.sh
- npm run build in tt-ts

## Rules

- One commit: `feat: add Netlify login debug endpoint and logging`
- Update docs/working-memory/open/tt-netlify-login-debug-20260224/updates.md with what you did
