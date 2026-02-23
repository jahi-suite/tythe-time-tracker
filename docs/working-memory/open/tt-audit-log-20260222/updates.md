# Updates: tt-audit-log-20260222

> Plan: [plan.md](./plan.md)

## Current Status

**2026-02-22** - Task created. Depends on tt-user-auth-20260222 completing first. Ready for execution after auth task.

---

## Progress

**2026-02-23** — audit-01 complete.
- Added `AUDIT_LOG_TABLE = "audit_log"` constant to `DatabaseConstants` in `tythe_time_tracker/core/constants.py`.
- Added `CREATE TABLE IF NOT EXISTS audit_log` DDL to `init_database()` in `tythe_time_tracker/database/init.py`.
- Columns: id (UUID PK DEFAULT gen_random_uuid()), action (TEXT CHECK in ('add','edit','delete')), target_table (TEXT NOT NULL), target_id (UUID), changed_by (TEXT NOT NULL), old_values (JSONB), new_values (JSONB), created_at (TIMESTAMPTZ DEFAULT NOW()).
- Commit: 4856fa6
- Marked audit-01 passes: true.

**2026-02-23** — audit-02 complete.
- Added `tythe_time_tracker/core/audit.py` with `log_change()` helper that opens a DB connection, normalizes JSON payloads, and writes audit records via the repository.
- Added `insert_audit_log()` and `get_audit_logs(filters)` to `tythe_time_tracker/database/repository.py` using psycopg2 and JSONB (`psycopg2.extras.Json`) for `old_values` / `new_values`.
- `get_audit_logs()` supports common filters (`action`, `target_table`, `target_id`, `changed_by`, date range, limit`) and returns ordered audit rows.
- Syntax check passed for changed modules (`python3 -m py_compile tythe_time_tracker/database/repository.py tythe_time_tracker/core/audit.py`).
- Story id: `audit-02`

**2026-02-23** — audit-03 complete.
- Wired audit logging into manager mutation service methods in `tythe_time_tracker/core/services.py`.
- `add_shift_manually_with_request()` now logs `action='add'` with `new_values` from the created `TimeEntry`.
- `edit_shift_with_request()` now loads the existing entry first and logs `action='edit'` with both `old_values` and `new_values`.
- `delete_entry()` now loads the entry before deletion and logs `action='delete'` with `old_values`.
- `changed_by` is sourced from `st.session_state.current_user['username']` via a new `_get_audit_username()` helper.
- Added `TimeEntry` -> audit payload serialization helper for consistent structured JSON snapshots.
- Syntax check passed for `tythe_time_tracker/core/services.py`.
- Story id: `audit-03`

## Verification

```bash
python3 -c "import json; d=json.load(open('docs/working-memory/open/tt-audit-log-20260222/user_story.json')); print(len([s for s in d['stories'] if not s.get('passes')]))"
# Prints 1 (audit-04 remains)
```
