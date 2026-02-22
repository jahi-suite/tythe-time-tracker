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

## Verification

Not yet run.
