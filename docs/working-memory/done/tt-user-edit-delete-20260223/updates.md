## 2026-02-23

- Task created. Goal: edit and delete user accounts in Manage Users.
- Implemented `update_user` and `delete_user` in `tythe_time_tracker/core/auth.py` with self-protection checks (when current user id is provided), validation, and duplicate username handling.
- Updated Manage Users UI in `tythe_time_tracker/ui/pages/manager_dashboard.py` with per-user Edit form (username, display name, role, optional password) and Delete confirmation; self edit/delete buttons are disabled.
- Verified touched modules compile with `python3 -m py_compile tythe_time_tracker/core/auth.py tythe_time_tracker/ui/pages/manager_dashboard.py`.
