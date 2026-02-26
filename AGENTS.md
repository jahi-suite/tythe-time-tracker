# AGENTS.md — Tythe Time Tracker

Operational guide for AI agents. Loaded each loop iteration.

---

## Project overview

Web app for **The Tythe Barn** to track staff time. Two implementations share the same Supabase (PostgreSQL) database:

1. **TypeScript app** (`src/`) — React (Vite) + Express. This is the primary development target.
2. **Python app** (`tythe_time_tracker/`) — Streamlit. Legacy reference implementation.

---

## Key commands

### TypeScript app (`src/`)

```bash
cd src && npm run dev        # dev server (client + server)
cd src && npm run build      # production build
cd src && npx tsc --noEmit   # typecheck only
```

### Python app (root)

```bash
streamlit run app.py         # run Streamlit app
```

### Scripts

```bash
scripts/status.sh            # project status
scripts/install-claude.sh    # install Claude CLI
```

---

## Architecture

### TypeScript app (`src/`)

```
src/
├── src/          # React client
│   ├── pages/    # Clock, Timesheet, Export, Manager
│   ├── components/
│   └── hooks/
└── server/       # Express API + services + exportUtils
```

- **Client:** React + Vite, TypeScript
- **Server:** Node/Express, TypeScript
- **Build:** `npm run build` builds both client and server

### Python app

```
tythe_time_tracker/
├── config/settings.py       # DB + app config
├── core/
│   ├── auth.py              # hash_password, verify_password, authenticate_user, create_user
│   ├── constants.py         # PayRateType, DatabaseConstants
│   ├── models.py            # TimeEntry dataclass
│   └── services.py          # TimeTrackingService (clock in/out, CRUD, timesheets)
├── database/
│   ├── connection.py        # get_db_connection()
│   ├── init.py              # table creation, seed manager
│   └── repository.py        # TimeEntryRepository
└── ui/pages/                # login, employee_interface, personal_timesheet, export_interface, manager_dashboard
```

---

## Database schema (Supabase / PostgreSQL)

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `username` | TEXT UNIQUE | login username |
| `password_hash` | TEXT | bcrypt |
| `role` | TEXT | `employee` \| `manager` \| `admin` |
| `display_name` | TEXT | shown in UI and stored in `time_entries.employee` |
| `active` | BOOLEAN | inactive users cannot log in |
| `standard_rate` | DECIMAL NULL | £/hr |
| `enhanced_rate` | DECIMAL NULL | £/hr |
| `supervisor_rate` | DECIMAL NULL | £/hr |
| `created_at` | TIMESTAMPTZ | |

### `time_entries`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `employee` | TEXT | display name of user who clocked in |
| `clock_in` | TIMESTAMPTZ | UTC |
| `clock_out` | TIMESTAMPTZ | UTC, NULL if shift open |
| `pay_rate_type` | TEXT | `Standard` \| `Enhanced` \| `Supervisor` |
| `venue_id` | UUID NULL | FK → venues (if multi-venue enabled) |
| `created_at` | TIMESTAMPTZ | |

### `audit_log`

Logs who changed what (edit/delete shifts, user changes).

### `venues`

Multi-venue support. Each venue has its own settings and users can be scoped to venues.

---

## Business rules

### Pay rates

- **Standard:** 4:00 AM – 7:00 PM BST
- **Enhanced:** 7:00 PM – 4:00 AM BST
- **Supervisor:** Overrides time-of-day; all hours billed at supervisor rate

Times stored UTC; display in BST. Per-user rates stored in `users` table.

### Break deduction

- Shifts **≥ 6 hours** → deduct **20 minutes** unpaid break
- Deduct from the **majority** rate segment (most hours); tie → deduct from Standard
- TypeScript: `src/server/exportUtils.ts` → `applyBreakDeduction`
- Python: `export_functions.apply_break_deduction`

---

## Config and secrets

- **Local:** `.env` file (see `env.example`)
- **Supabase:** Use **Session pooler** host in production
- Required env vars: `SUPABASE_HOST`, `SUPABASE_DATABASE`, `SUPABASE_USER`, `SUPABASE_PASSWORD`, `SUPABASE_PORT`
- Optional: `SEED_MANAGER_USERNAME`, `SEED_MANAGER_PASSWORD` (first admin bootstrap)

---

## Git discipline

- Commit after every atomic change
- Conventional prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`
- Never commit `.env` or secrets
- No force-push to main
- Trunk-based development

---

## Subagents

You can and should spawn subagents for parallelisable work. Examples:

- **Explore** — delegate deep codebase searches to keep your context clean
  - "Find all places that reference `pay_rate_type`"
  - "How does the export route work end to end?"
- **Parallel implementation** — spawn one agent per independent module (e.g. client component + server route at the same time)
- **Verification** — spawn an agent to run the build and report results while you prepare the next change

Prefer subagents when a task has two or more independent parts that don't need to share context.

---

## Workflow

1. Read `IMPLEMENTATION_PLAN.md` — find first incomplete task
2. Read relevant spec in `specs/`
3. Implement one atomic unit (spawn subagents for independent parts)
4. Run `cd src && npx tsc --noEmit && npm run build` — must pass
5. Commit
6. Mark task complete in `IMPLEMENTATION_PLAN.md`, commit
7. Write summary
