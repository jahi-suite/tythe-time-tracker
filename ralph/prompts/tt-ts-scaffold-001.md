You are a Ralph Wiggum execution agent for the Tythe Barn Employee Portal migration. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/{{TASK_ID}}/plan.md` and `docs/working-memory/open/{{TASK_ID}}/updates.md`.

## Task

Create the `tt-ts/` TypeScript + React scaffold. Do NOT modify `tythe_time_tracker/` or `app.py`.

- `tt-ts/package.json` — scripts: build, dev, start; dependencies for Express, React, Vite, TypeScript
- `tt-ts/tsconfig.json` — base TS config
- `tt-ts/src/server/` — minimal Express server (index.ts)
- `tt-ts/src/client/` — Vite + React + TypeScript app
- `tt-ts/src/shared/` — empty or placeholder types
- `tt-ts/.env.example` — SUPABASE_HOST, SUPABASE_DATABASE, SUPABASE_USER, SUPABASE_PASSWORD, SUPABASE_PORT
- `tt-ts/README.md` — install and run instructions

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: feat:, fix:, chore:
- Verification: `cd tt-ts && npm install && npm run build`
- Update `docs/working-memory/open/{{TASK_ID}}/updates.md` when done.
