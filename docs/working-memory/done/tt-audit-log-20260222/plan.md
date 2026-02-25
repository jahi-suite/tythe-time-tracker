# Task: tt-audit-log-20260222

> Created: 2026-02-22 | Status: planning
> Stories: [user_story.json](./user_story.json)

## What and why

- **Current:** No audit trail. Manager edits, deletes, and manual shift additions are untracked. No way to know who changed whose hours or when.
- **Target:** Full audit logging system. Every add, edit, and delete of time entries is recorded with who made the change, what was changed (before/after values), and when. Managers can view the changelog from the dashboard.
- **Why:** Accountability and transparency. Managers need to see who changed whose hours to prevent errors and disputes.

## Context

- App is Streamlit + Supabase (PostgreSQL via psycopg2). Code lives in `tythe_time_tracker/`.
- **Depends on tt-user-auth-20260222** — needs `st.session_state.current_user` for the `changed_by` field.
- Manager operations that need logging are in `tythe_time_tracker/core/services.py`: `add_shift_manually()`, `edit_shift()`, `delete_entry()`.
- Database repo in `tythe_time_tracker/database/repository.py` handles the actual SQL.
- Manager dashboard in `tythe_time_tracker/ui/pages/manager_dashboard.py` has tabs for View All, Add Shift, Edit Shift, Delete Entry.
- Run stories in order: audit-01 through audit-04.

## Verification command

Story-based: all stories in user_story.json have `passes: true`.

```bash
python3 -c "import json; d=json.load(open('docs/working-memory/open/tt-audit-log-20260222/user_story.json')); print(len([s for s in d['stories'] if not s.get('passes')]))"
# Should print 0
```

## Steps (by story)

1. **audit-01** — Create `audit_log` table via `tythe_time_tracker/database/init.py`. Columns: id (UUID PK DEFAULT gen_random_uuid()), action (TEXT NOT NULL, CHECK IN ('add','edit','delete')), target_table (TEXT NOT NULL), target_id (UUID), changed_by (TEXT NOT NULL), old_values (JSONB), new_values (JSONB), created_at (TIMESTAMPTZ DEFAULT NOW()).
2. **audit-02** — Create audit logging service. New file `tythe_time_tracker/core/audit.py` with `log_change(action, target_table, target_id, changed_by, old_values, new_values)`. Add repository method `insert_audit_log()` in `repository.py` and `get_audit_logs(filters)` for querying.
3. **audit-03** — Wire audit logging into existing operations. Call `log_change()` from `services.py` on `add_shift_manually()`, `edit_shift()`, and `delete_entry()`. For edits, capture the old values before updating. For deletes, capture the deleted record. For adds, capture the new values. The `changed_by` comes from `st.session_state.current_user['username']`.
4. **audit-04** — Manager changelog view. New "Change Log" tab in manager dashboard. Shows audit entries in a table with columns: timestamp, action, employee affected, changed by, summary of changes. Filters: date range picker, employee name dropdown, action type dropdown. For edits, show before/after diff of changed fields.

## Affected files

- `tythe_time_tracker/database/init.py` (audit_log table DDL)
- `tythe_time_tracker/database/repository.py` (insert_audit_log, get_audit_logs)
- `tythe_time_tracker/core/audit.py` (new: log_change service)
- `tythe_time_tracker/core/services.py` (wire audit calls into add/edit/delete)
- `tythe_time_tracker/ui/pages/manager_dashboard.py` (Change Log tab)
