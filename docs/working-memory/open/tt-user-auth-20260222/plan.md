# Task: tt-user-auth-20260222

> Created: 2026-02-22 | Status: planning
> Stories: [user_story.json](./user_story.json)

## What and why

- **Current:** No user accounts. Employees type their name to clock in/out. Managers share a single password from an environment variable (`MANAGER_PASSWORD`).
- **Target:** Full user authentication system with individual accounts for everyone. Employees log in with username/password to clock in/out. Managers have individual accounts with role-based access. Any manager can create new employee or manager accounts.
- **Why:** Security, accountability, and multi-manager support. Individual accounts enable audit logging (who changed what) and eliminate shared credentials.

## Context

- App is Streamlit + Supabase (PostgreSQL). Code lives in `tythe_time_tracker/`.
- Current manager auth: single password in `st.session_state.manager_authenticated` (see `tythe_time_tracker/ui/pages/manager_dashboard.py`).
- Current employee identity: free-text name entry in `tythe_time_tracker/ui/pages/employee_interface.py`.
- Database connection via `tythe_time_tracker/database/connection.py` using psycopg2.
- Main app entry: `tythe_time_tracker/ui/app.py` with sidebar navigation.
- Run stories in order: auth-01 through auth-07. Each story is one or more atomic changes; mark story `passes: true` when acceptance criteria are met.

## Verification command

Story-based: all stories in user_story.json have `passes: true`.

```bash
python3 -c "import json; d=json.load(open('docs/working-memory/open/tt-user-auth-20260222/user_story.json')); print(len([s for s in d['stories'] if not s.get('passes')]))"
# Should print 0
```

## Steps (by story)

1. **auth-01** — Create `users` table in Supabase via `tythe_time_tracker/database/init.py`. Columns: id (UUID PK), username (TEXT UNIQUE NOT NULL), password_hash (TEXT NOT NULL), role (TEXT NOT NULL DEFAULT 'employee', CHECK IN ('employee','manager')), display_name (TEXT NOT NULL), active (BOOLEAN DEFAULT true), created_at (TIMESTAMPTZ DEFAULT NOW()).
2. **auth-02** — Add bcrypt-based password hashing. New file `tythe_time_tracker/core/auth.py` with `hash_password(plain)` and `verify_password(plain, hashed)`. Add `bcrypt` to `requirements.txt`.
3. **auth-03** — Create login page. New function in `tythe_time_tracker/ui/pages/` or in `ui/app.py`. Username + password form. On success, store user dict (id, username, role, display_name) in `st.session_state.current_user`. Show error on bad credentials.
4. **auth-04** — Protect all routes. Every page function checks `st.session_state.current_user`. Manager dashboard checks `role == 'manager'`. Unauthenticated → show login. Add logout button to sidebar.
5. **auth-05** — Seed first manager on DB init. If users table is empty, create manager from env vars `SEED_MANAGER_USERNAME` and `SEED_MANAGER_PASSWORD` (with display_name "Admin"). Skip if vars not set.
6. **auth-06** — Manager user management. New "Manage Users" tab in manager dashboard. Form: username, password, display_name, role (employee/manager). List all users with active/deactivate toggle.
7. **auth-07** — Wire employee identity to session. Clock in/out uses `st.session_state.current_user['display_name']` instead of text input. Personal timesheet auto-filters to logged-in user. Remove free-text name entry from employee interface.

## Affected files

- `tythe_time_tracker/database/init.py` (users table DDL, seed manager)
- `tythe_time_tracker/database/repository.py` (user CRUD methods)
- `tythe_time_tracker/core/auth.py` (new: hashing, verification, user lookup)
- `tythe_time_tracker/ui/app.py` (login gate, session management, logout)
- `tythe_time_tracker/ui/pages/manager_dashboard.py` (replace old auth, add Manage Users tab)
- `tythe_time_tracker/ui/pages/employee_interface.py` (use session identity)
- `tythe_time_tracker/ui/pages/personal_timesheet.py` (auto-filter to logged-in user)
- `requirements.txt` (add bcrypt)
