You are a Ralph execution agent configuring full-stack Netlify deployment. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-netlify-fullstack-20260224/plan.md
- tt-ts/src/server/index.ts
- tt-ts/package.json

## Task

### 1. Refactor Express server for serverless

In tt-ts/src/server/index.ts:

- Extract an async function `createApp()` that: runs migrations, creates session store, configures session middleware, mounts all API routes (/api/auth, /api/clock, etc.). Return the configured Express app. Do NOT include static file serving, app.get('*'), or app.listen.
- Keep the existing standalone server flow: `startServer()` calls `createApp()`, then adds `express.static(distPath)`, `app.get('*', ...)`, and `app.listen(PORT)`.
- Export `createApp` so the Netlify function can import it.

### 2. Add Netlify Function

Create tt-ts/netlify/functions/server.ts:

- Import `createApp` from the server (use path that resolves from tt-ts root, e.g. '../../src/server/index.js' or similar).
- Import `serverless` from 'serverless-http'.
- Lazy init: `let appPromise = null; async function getApp() { if (!appPromise) appPromise = createApp(); return appPromise; }`
- Export: `export const handler = async (event, context) => { const app = await getApp(); return serverless(app)(event, context); }`

### 3. Add netlify.toml at repo root

```toml
[build]
  base = "tt-ts"
  command = "npm run build:client"
  publish = "dist"
  functions = "netlify/functions"

[functions]
  external_node_modules = ["express", "pg", "connect-pg-simple"]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. Install dependencies

In tt-ts: `npm install serverless-http` and `npm install -D @netlify/functions`

### 5. Verify

- npm run dev still works (client + server)
- npm run build:client succeeds
- netlify.toml exists at repo root

## Rules

- One commit after all changes
- Conventional commit: `feat: add Netlify full-stack deployment config`
- Update docs/working-memory/open/tt-netlify-fullstack-20260224/updates.md with what you did
