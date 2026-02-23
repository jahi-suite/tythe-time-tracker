# Task: tt-export-admin-20260223

> Created: 2026-02-23 | Status: in progress
> Goal: Managers AND admins can export any timesheet in Streamlit

## Summary

**Bug:** Export page shows "Employee Export Access — You can only export your own timesheet" for both managers and admins. Admins (and possibly managers) are treated as employees.

**Cause:** `_is_manager()` in `tythe_time_tracker/ui/pages/export_interface.py` only checks `role == "manager"`. It does NOT include `role == "admin"`. Admins get employee treatment.

**Fix:** Change `_is_manager()` to treat both manager and admin as export-privileged:
```python
return str(user.get("role") or "") in ("manager", "admin")
```
Or use `is_admin_or_manager` from `core.auth` if already imported.

## Context

- Export page: `tythe_time_tracker/ui/pages/export_interface.py` — `_is_manager()` at line 19–22
- Auth: `core.auth.is_admin_or_manager()` returns True for manager or admin
- Manager dashboard uses `is_admin_or_manager` for access checks

## Verification

```bash
grep -n "_is_manager\|is_admin_or_manager" tythe_time_tracker/ui/pages/export_interface.py
# _is_manager should return True for role in (manager, admin)
```

Run Streamlit, log in as admin, go to Export — should see "Manager Export Access" and export options for any employee.

## Rules

- One change; commit after.
- Conventional commit: `fix(streamlit):`
- Update `docs/working-memory/open/tt-export-admin-20260223/updates.md`
