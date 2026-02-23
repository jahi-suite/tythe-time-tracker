# Task: tt-ts-scaffold-001

> Created: 2026-02-23 | Status: in progress
> Phase: 0 — Scaffold

## What and why

- **Goal:** Create the `tt-ts/` TypeScript + React scaffold. No app logic yet — just the project structure, build config, and runnable skeleton.
- **Why:** Foundation for the full migration. Must not modify `tythe_time_tracker/` or `app.py`.

## Context

- All new code lives under `tt-ts/`
- Same Supabase DB will be used (schema created by Python init)
- Stack: React 18 + TypeScript, Express + TypeScript, Vite for client

## Steps

1. Create `tt-ts/package.json` with scripts: build, dev, start
2. Create `tt-ts/tsconfig.json` (and tsconfig for server/client if needed)
3. Create `tt-ts/src/server/` — minimal Express server
4. Create `tt-ts/src/client/` — minimal React app (Vite)
5. Create `tt-ts/src/shared/` — placeholder for shared types
6. Create `tt-ts/.env.example` with SUPABASE_* vars
7. Create `tt-ts/README.md` with run instructions

## Verification

```bash
cd tt-ts && npm install && npm run build
```

## Key files

- `tt-ts/package.json`
- `tt-ts/tsconfig.json`
- `tt-ts/src/server/index.ts`
- `tt-ts/src/client/` (Vite React app)
- `tt-ts/.env.example`
