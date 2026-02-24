You are a Ralph execution agent fixing Netlify 502 on /api/debug and /api/health. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-netlify-502-debug-20260224/plan.md
- tt-ts/netlify/functions/server.ts

## Task

The handler uses static `import { createApp }` which runs when the function module loads. If the server module throws during import (e.g. DB config, missing deps), the handler never runs and our try/catch never executes — Netlify returns 502.

**Fix:** Use dynamic import so the server loads inside the try block.

1. Remove the top-level `import { createApp } from '...'`
2. Remove appPromise caching (or refactor to cache after successful dynamic import)
3. In the handler try block: `const { createApp } = await import('../../src/server/index.js')` then `const app = await createApp()`
4. Keep the catch block that returns jsonResponse(200, diagnostic) on any error

The dynamic import path must resolve correctly from tt-ts/netlify/functions/server.ts. Use the same path format as before: `../../src/server/index.js` (relative to the function file, which lives in tt-ts/netlify/functions/).

## Verify

- Run ./ralph/verify-tt-netlify-502-debug-20260224.sh
- npm run build in tt-ts

## Rules

- One commit: `fix: use dynamic import in Netlify handler to catch module-load errors`
- Update docs/working-memory/open/tt-netlify-502-debug-20260224/updates.md
