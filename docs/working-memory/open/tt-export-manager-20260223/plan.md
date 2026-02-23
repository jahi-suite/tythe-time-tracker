# Task: tt-export-manager-20260223

> Created: 2026-02-23 | Status: in progress
> Stories: [user_story.json](./user_story.json)

## What and why

- **Bug:** Managers cannot export timesheets. Export page shows "You can only export your own timesheet" and asks for a name, treating managers as employees.
- **Cause:** Export interface uses `st.session_state.get('manager_authenticated', False)` but auth uses `st.session_state.current_user` with `role` field. `manager_authenticated` is never set.
- **Fix:** Use `current_user.get("role") == "manager"` instead of `manager_authenticated`.

## Context

- Auth: `st.session_state.current_user` has `id`, `username`, `role`, `display_name`. Role is "manager" or "employee".
- Export page: `tythe_time_tracker/ui/pages/export_interface.py` — all `manager_authenticated` checks must use `current_user["role"]`.
- Manager dashboard correctly uses `user.get("role") != "manager"` in `check_manager_role()`.

## Verification

```bash
grep -n "manager_authenticated" tythe_time_tracker/
# Should return 0 matches after fix
```
