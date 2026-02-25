# Updates: tt-netlify-fullstack-20260224

## 2026-02-24

Confirmed the Express server refactor in `tt-ts/src/server/index.ts`:
- Exported async `createApp()` that runs migrations, initializes the session store/session middleware, and mounts API routes
- Kept `startServer()` as the standalone runtime path that adds static SPA serving and `app.listen(...)`
- Guarded `startServer()` so importing the module (for serverless) does not auto-start the process

Added Netlify full-stack deployment files:
- `tt-ts/netlify/functions/server.ts` with lazy `createApp()` initialization wrapped by `serverless-http`
- `netlify.toml` at repo root with build settings, function config, and redirects for `/api/*` and SPA fallback

Verification:
- `npm run build:client` succeeded (Vite build completed)
- `npm run dev` could not be fully verified in this sandbox because `tsx watch` failed with `EPERM` creating its IPC pipe under `/tmp/tsx-1000/*.pipe`
- Confirmed `netlify.toml` exists at repo root

Dependency install status:
- Attempted `npm install serverless-http` and `npm install -D @netlify/functions`, but package installation is blocked in this environment (npm hangs during resolution due restricted network/sandbox constraints), so `tt-ts/package.json`/lockfile were not updated here
