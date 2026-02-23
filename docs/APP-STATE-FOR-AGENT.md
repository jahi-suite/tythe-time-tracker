# The Tythe Barn – Time Tracker: Current State (for agent handoff)

This document describes the application as it exists today so another agent can discuss or extend it.

---

## What it is

Web app for **The Tythe Barn** to track staff time: clock in/out, view timesheets, and manage entries. Built with **Streamlit** and **Supabase (PostgreSQL)**. Deployable on Streamlit Cloud.

---

## Tech stack

| Layer      | Technology |
|-----------|------------|
| UI        | Streamlit (single-page app with sidebar navigation) |
| Backend   | Python 3, `tythe_time_tracker` package |
| Database  | Supabase (PostgreSQL), connection via `psycopg2-binary` |
| Auth      | Custom: `users` table, bcrypt passwords, session in `st.session_state.current_user` |
| Config    | `.env` locally; Streamlit Secrets (TOML) on Cloud |

Key deps: `streamlit`, `psycopg2-binary`, `bcrypt`, `pandas`, `openpyxl`, `reportlab`, `streamlit-aggrid`, `python-dotenv`.

---

## Entry point and flow

- **Run:** `streamlit run app.py` (from repo root; `app.py` imports and runs `tythe_time_tracker.ui.app.main()`).
- **Startup:** `setup_page_config()` → `initialize_database()` (creates tables, optionally seeds first manager) → **login gate**: if no `st.session_state.current_user`, show login page and return; else show main app with sidebar and selected page.
- **Navigation:** Sidebar selectbox: "Employee Clock In/Out" | "Personal Timesheet" | "Export Timesheet" | "Manager Dashboard". `route_to_page()` calls the corresponding page’s `show()`.

---

## Authentication

- **Login:** `tythe_time_tracker.ui.pages.login.show()` – username + password form; calls `authenticate_user()`; on success sets `st.session_state.current_user = { id, username, role, display_name }` and reruns.
- **First user:** If `users` table is empty, the login page shows "Set up your admin account" — a form for username, display name, and password. No secrets editing required. Optional: expander "Advanced: Create from Streamlit secrets instead" for `SEED_MANAGER_USERNAME` / `SEED_MANAGER_PASSWORD` → `bootstrap_seed_manager()`.
- **Protection:** Every page assumes an authenticated user; manager dashboard also checks `current_user["role"] == "manager"`. Logout clears session (sidebar).
- **Auth helpers:** `tythe_time_tracker.core.auth`: `hash_password`, `verify_password`, `authenticate_user`, `create_user`, `get_all_users`, `set_user_active`.

---

## Pages (and what they do)

1. **Employee Clock In/Out** (`ui.pages.employee_interface`)  
   - Clock in / clock out for the **logged-in user** (uses `current_user["display_name"]`).  
   - Supervisor checkbox (affects pay rate).  
   - Shows current open shift if any.

2. **Personal Timesheet** (`ui.pages.personal_timesheet`)  
   - Lists time entries for the **logged-in user** (filtered by display name).  
   - Date range and pay-rate summary.

3. **Export Timesheet** (`ui.pages.export_interface`)  
   - Export to Excel or PDF; date range and (for managers) employee filter.  
   - Uses `export_functions.export_to_excel` / `export_to_pdf`.

4. **Manager Dashboard** (`ui.pages.manager_dashboard`)  
   - **Requires** `role == "manager"`.  
   - Tabs: **View All Entries** (grouped by staff, quick export), **Add Shift**, **Edit Shift**, **Delete Entry**, **Manage Users**.  
   - **Manage Users:** Form to create user (username, password, display name, role: employee | manager). List of all users with Active/Inactive and Activate/Deactivate buttons (cannot deactivate self).

---

## Database schema

- **`users`**  
  `id` (UUID PK), `username` (TEXT UNIQUE), `password_hash` (TEXT), `role` (TEXT: 'employee'|'manager'), `display_name` (TEXT), `active` (BOOLEAN), `created_at` (TIMESTAMPTZ).  
  Created in `tythe_time_tracker.database.init`; seed manager inserted when table is empty and seed env/secrets are set.

- **`time_entries`**  
  `id` (UUID PK), `employee` (TEXT – stores display name of the user who clocked in), `clock_in` (TIMESTAMPTZ), `clock_out` (TIMESTAMPTZ), `pay_rate_type` (TEXT: Standard | Enhanced | Supervisor), `created_at` (TIMESTAMPTZ).  
  Created in same `init`; business logic in `tythe_time_tracker.core.services.TimeTrackingService`; persistence in `tythe_time_tracker.database.repository.TimeEntryRepository`.

No audit_log table yet (planned in Ralph task `tt-audit-log-20260222`).

---

## Config and secrets

- **Local:** `.env` (or env vars). `get_database_config()` / `get_app_config()` try Streamlit secrets first, then fall back to env (see `tythe_time_tracker.config.settings`).
- **Streamlit Cloud:** Secrets in TOML. Required under `[SUPABASE]`: `HOST`, `DATABASE`, `USER`, `PASSWORD`, `PORT`. Optional: `SEED_MANAGER_USERNAME`, `SEED_MANAGER_PASSWORD` for first admin; legacy `MANAGER_PASSWORD` still read but auth is now user-based.
- **DB:** Use Supabase **Session pooler** host in production (direct connection often fails from Cloud).

---

## Project layout (relevant to behaviour)

```
tythe-time-tracker/
├── app.py                          # Entry: streamlit run app.py
├── export_functions.py             # Excel/PDF export helpers
├── requirements.txt
├── tythe_time_tracker/
│   ├── config/settings.py          # DB + app config from env/secrets
│   ├── core/
│   │   ├── auth.py                 # Auth: hash, verify, authenticate_user, create_user, get_all_users, set_user_active
│   │   ├── constants.py             # PayRateType, DatabaseConstants, etc.
│   │   ├── models.py               # TimeEntry dataclass
│   │   └── services.py             # TimeTrackingService (clock in/out, CRUD, get timesheets)
│   ├── database/
│   │   ├── connection.py           # get_db_connection(), DatabaseConnection
│   │   ├── init.py                 # Tables (users, time_entries), seed manager, bootstrap_seed_manager()
│   │   └── repository.py           # TimeEntryRepository
│   ├── ui/
│   │   ├── app.py                  # main(), login gate, navigation, route_to_page
│   │   └── pages/
│   │       ├── login.py            # Login form + bootstrap first admin
│   │       ├── employee_interface.py
│   │       ├── personal_timesheet.py
│   │       ├── export_interface.py
│   │       └── manager_dashboard.py
│   └── utils/                      # time_utils, date_utils
├── docs/
│   ├── APP-STATE-FOR-AGENT.md      # This file
│   └── working-memory/open/        # Ralph task plans (auth, audit, mobile, branding)
└── ralph/                          # Ralph scripts (run.sh, status.sh, prompts, loops)
```

---

## Ralph tasks (current)

- **tt-user-auth-20260222** – User auth, login, manager seed, manage users (stories marked complete).
- **tt-audit-log-20260222** – Audit log table + changelog for managers (not implemented yet).
- **tt-mobile-fix-20260222** – Mobile viewport/config (not implemented yet).
- **tt-kari-branding-20260222** – “Powered by Kari Suite” footer + login branding (partially or fully done per updates).

Run a task: from repo root, `./ralph/run.sh <task-id>`. Backend is configurable (default Claude; `RALPH_BACKEND=cursor` for Cursor).

---

## Pay rates (business rule)

- **Standard:** 4:00 AM–7:00 PM BST.  
- **Enhanced:** 7:00 PM–4:00 AM BST.  
- **Supervisor:** Overrides; all hours at supervisor rate.  
Times stored UTC; display uses BST. Logic in `core.services` / `utils.time_utils`.

---

## What’s *not* in the app yet

- Audit log / changelog (who changed whose hours).
- “Powered by Kari Suite” everywhere (may be partial).
- Mobile-specific fixes (viewport/config).
- No automated tests referenced in this doc (pytest present in requirements).

Use this file as the single source of truth for “how the app works today” when briefing another agent.
