# Task: tt-netlify-502-debug-20260224

## Goal

Fix persistent 502 on /api/debug and /api/health in Netlify. The handler's try/catch never runs because the error occurs at **module load time** when `import { createApp }` loads the server module — before the handler executes.

## Root Cause

Static import runs when the function module loads. If the server module (or any of its transitive imports) throws during load, the handler never runs, so our catch block never executes. Netlify returns 502.

## Solution

Use **dynamic import** so the server is loaded inside the try block:

```ts
export const handler = async (event: unknown, context: unknown) => {
  try {
    const { createApp } = await import('../../src/server/index.js')
    const app = await createApp()
    return serverless(app)(event as never, context as never)
  } catch (err) {
    // ... return diagnostic
  }
}
```

Remove the top-level import and appPromise caching (or keep a cache but populate it inside the try after dynamic import).

## Files

- tt-ts/netlify/functions/server.ts

## Verification

- ./ralph/verify-tt-netlify-502-debug-20260224.sh
- npm run build in tt-ts
