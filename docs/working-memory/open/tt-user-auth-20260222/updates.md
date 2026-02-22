# Updates: tt-user-auth-20260222

> Plan: [plan.md](./plan.md)

## Current Status

**2026-02-22** - Task created. Ready for execution.

---

## Progress

**2026-02-22 — auth-01: Create users table in Supabase**
- Added `UserRole` enum (`employee`, `manager`) to `constants.py`
- Added `USERS_TABLE` and user column constants (`USERNAME_COLUMN`, `PASSWORD_HASH_COLUMN`, `ROLE_COLUMN`, `DISPLAY_NAME_COLUMN`, `ACTIVE_COLUMN`) to `DatabaseConstants`
- Added `CREATE TABLE IF NOT EXISTS users` DDL to `init_database()` in `database/init.py`
- Added matching DDL to `DatabaseConnection.initialize_tables()` in `database/connection.py`
- Users table: id (UUID PK), username (TEXT UNIQUE NOT NULL), password_hash (TEXT NOT NULL), role (TEXT NOT NULL DEFAULT 'employee' CHECK IN (employee, manager)), display_name (TEXT NOT NULL), active (BOOLEAN DEFAULT true), created_at (TIMESTAMPTZ DEFAULT NOW())
- Commit: `b7a59ee`

**2026-02-22 — auth-02: Password hashing utility with bcrypt**
- Created `tythe_time_tracker/core/auth.py` with `hash_password(plain)` and `verify_password(plain, hashed)` using bcrypt
- Added `bcrypt>=4.0.0` to `requirements.txt`
- Verified: correct password returns True, wrong password returns False
- Commit: `9f54546`

**2026-02-22 — auth-03: Login page**
- Added `authenticate_user(username, password)` to `tythe_time_tracker/core/auth.py`: queries `users` table for active user, verifies bcrypt password, returns `{id, username, role, display_name}` or None
- Created `tythe_time_tracker/ui/pages/login.py`: Streamlit form with username + password fields, calls `authenticate_user`, stores result in `st.session_state.current_user`, shows error on bad credentials
- Updated `tythe_time_tracker/ui/app.py`: login gate in `main()` — if `current_user` not in session_state, show `login.show()` and return
- Updated `tythe_time_tracker/ui/pages/__init__.py`: added `login` module import and export
- Story auth-03 acceptance criteria met; marked `passes: true`
- Commit: `8f4ce45`

**2026-02-22 — auth-04: Protect all routes behind authentication**
- `app.py` `show_navigation()`: added sidebar user display (display_name + role) and Logout button that deletes `st.session_state.current_user` and calls `st.rerun()`
- `manager_dashboard.py`: replaced `handle_manager_authentication()` (shared-password approach) with `check_manager_role()` — checks `st.session_state.current_user` exists and `role == 'manager'`; shows "Access denied" error for non-managers
- Removed `get_app_config` import from `manager_dashboard.py` (no longer used)
- Existing login gate in `app.py` `main()` already covered unauthenticated → login redirect (auth-03)
- Story auth-04 acceptance criteria met; marked `passes: true`
- Commit: `3b4511f`

**2026-02-22 — auth-05: Seed first manager on DB init**
- Added `import os` to `database/init.py`
- Added `_seed_manager_if_empty(conn)` helper: reads `SEED_MANAGER_USERNAME` + `SEED_MANAGER_PASSWORD` env vars; skips if either is absent or users table has any rows; otherwise hashes password with bcrypt and inserts a `role='manager'`, `display_name='Admin'` account
- Called `_seed_manager_if_empty(conn)` from `init_database()` after table creation block
- Story auth-05 acceptance criteria met; marked `passes: true`
- Commit: `272e7b0`

## Verification

Not yet run.
