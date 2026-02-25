# AGENTS.md

## Cursor Cloud specific instructions

### Services overview

This repo contains two apps sharing the same PostgreSQL database:

| Service | Stack | Dev command | Port |
|---------|-------|-------------|------|
| **tt-ts** (TypeScript app) | React + Express + Vite | `cd tt-ts && npm run dev` | 5173 (client), 3000 (API) |
| **Streamlit app** (Python) | Streamlit + psycopg2 | `streamlit run app.py --server.port 8501 --server.headless true` | 8501 |

Both apps require a PostgreSQL database. Standard commands for lint/test/build are in `tt-ts/package.json` and `pyproject.toml`.

### PostgreSQL (local)

A local PostgreSQL 16 instance is pre-installed. Start it if not running:

```
sudo pg_ctlcluster 16 main start
```

Credentials: user `ttdev`, password `ttdev123`, database `tythe_tracker`, host `127.0.0.1:5432`. The schema (tables `users`, `time_entries`, `audit_log`) is already created.

### Environment files

- `/workspace/.env` — Python/Streamlit app config (points to local PG)
- `/workspace/tt-ts/.env` — TypeScript app config (points to local PG, `SESSION_STORE=memory`)

These are `.gitignore`d. If missing, copy from `env.example` / `tt-ts/.env.example` and set local PG credentials.

### Gotchas

- **SSL**: Local PostgreSQL has SSL enabled with a self-signed cert. The TypeScript app sets `ssl: { rejectUnauthorized: false }` by default, which works with the local setup. Set `DB_SSL_REJECT_UNAUTHORIZED=false` in `tt-ts/.env`.
- **Python tools PATH**: pip installs scripts to `~/.local/bin`. Run `export PATH="$HOME/.local/bin:$PATH"` or it's already in `~/.bashrc`.
- **TypeScript type checking**: Use `npx tsc -p tsconfig.server.json --noEmit` for server code. The root `tsconfig.json` doesn't set `jsx`, so `tsc --noEmit` on the full project will fail on `.tsx` files (Vite handles JSX at build time).
- **First admin setup**: When the users table is empty, navigate to the app or call `POST /api/auth/first-setup` with `{"username","password","displayName"}` to create the first manager account. Alternatively set `SEED_MANAGER_USERNAME` / `SEED_MANAGER_PASSWORD` in `.env`.
- **Python lint**: The Python codebase has pre-existing `black`/`isort`/`flake8` formatting issues — these are in the existing code, not from your changes.
- **Database tables**: The TypeScript app's `runMigrations()` only adds columns/indexes to existing tables. Base table creation is done by the Python app's `init_database()` or manually via SQL. If you're working only with the TypeScript app, ensure the schema exists first.
