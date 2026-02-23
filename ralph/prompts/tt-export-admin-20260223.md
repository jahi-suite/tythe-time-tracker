You are a Ralph Wiggum execution agent for the Tythe Barn Employee Portal. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-export-admin-20260223/plan.md`.

## Task

Fix the Streamlit export page so **managers AND admins** see "Manager Export Access" and can export any employee's timesheet.

**Bug:** `_is_manager()` in `tythe_time_tracker/ui/pages/export_interface.py` only checks `role == "manager"`. Admins are treated as employees and see "You can only export your own timesheet."

**Fix:** Change `_is_manager()` to return True for both manager and admin:
```python
return str(user.get("role") or "") in ("manager", "admin")
```

Or import and use `is_admin_or_manager` from `tythe_time_tracker.core.auth`.

## Rules

- One atomic change; commit after.
- Conventional commit: `fix(streamlit): allow admins manager export access`
- Update `docs/working-memory/open/tt-export-admin-20260223/updates.md`
