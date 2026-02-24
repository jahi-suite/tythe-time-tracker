# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Tythe Time Tracker — employee time tracking system with two app implementations sharing the same PostgreSQL database:

| App | Stack | Location | Dev command | Port(s) |
|-----|-------|----------|-------------|---------|
| TypeScript app | React + Express + Vite | `tt-ts/` | `npm run dev` | Client: 5173, API: 3000 |
| Python app | Streamlit | root | `streamlit run app.py` | 8501 |

### Database

Both apps use PostgreSQL (Supabase in production, local PostgreSQL for development). The TS app does **not** auto-create tables — they must exist before the Express server starts. The Python app creates tables via `DatabaseConnection.initialize_tables()` on startup, but it hardcodes `sslmode=require`, so a local PostgreSQL instance must have SSL enabled (Ubuntu's `postgresql` apt package enables SSL by default).

If starting from a fresh database, create tables manually or run the Python app first (which will create them). See the `CREATE TABLE` statements in `tythe_time_tracker/database/connection.py` for the schema.

### Environment variables

Both apps read `SUPABASE_HOST`, `SUPABASE_DATABASE`, `SUPABASE_USER`, `SUPABASE_PASSWORD`, `SUPABASE_PORT` from `.env` files. Templates: `env.example` (Python), `tt-ts/.env.example` (TypeScript). The TS app also needs `SESSION_SECRET`.

### Lint / Test / Build commands

- **Python lint:** `black --check .` and `flake8 --max-line-length=88 --extend-ignore=E203,W503 tythe_time_tracker/`
- **Python tests:** `python3 -m pytest tests/ -v` (62 unit tests, no DB required)
- **TS server type check:** `npx tsc -p tsconfig.server.json --noEmit` (from `tt-ts/`)
- **TS build:** `npm run build` (from `tt-ts/`) — builds both client (Vite) and server (tsc)
- **TS security tests:** `npm run test:security` (from `tt-ts/`) — requires build first, no DB required
- Note: `npx tsc --noEmit` (without `-p tsconfig.server.json`) fails on JSX files because `tsconfig.json` lacks the `jsx` flag; Vite handles JSX transformation for the client. Use the server-specific tsconfig for type checking.

### Gotchas

- The `streamlit` binary installs to `~/.local/bin/` which may not be on PATH. Use `export PATH="$HOME/.local/bin:$PATH"` or invoke via `python3 -m streamlit`.
- The TS app's `runMigrations()` in `src/server/db/migrate.ts` assumes `time_entries` and `users` tables already exist. It only adds/backfills the `user_id` column. If tables don't exist, the Express server crashes on startup.
- Python DB connection hardcodes `sslmode="require"`. Local PostgreSQL must have SSL enabled.
- Setting `SEED_MANAGER_USERNAME` and `SEED_MANAGER_PASSWORD` in the TS app's `.env` auto-creates the first admin when the users table is empty.
