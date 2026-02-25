# Task: tt-netlify-fullstack-20260224

> Configure full-stack Netlify deployment: Express as serverless function, frontend, Supabase.

## Goal

1. Refactor Express server to export async `createApp()` for serverless
2. Add `tt-ts/netlify/functions/server.ts` wrapping Express with serverless-http
3. Add `netlify.toml` at repo root (build, functions, redirects)
4. Install serverless-http, @netlify/functions
5. Keep local dev working

## Key Files

- tt-ts/src/server/index.ts (refactor)
- tt-ts/netlify/functions/server.ts (create)
- netlify.toml (create at repo root)

## Verification

```bash
./ralph/verify-tt-netlify-fullstack-20260224.sh
```
