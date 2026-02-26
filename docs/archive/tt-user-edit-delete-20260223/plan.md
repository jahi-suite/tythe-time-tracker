# Task: tt-user-edit-delete-20260223

> Created: 2026-02-23 | Status: in progress
> Stories: [user_story.json](./user_story.json)

## What and why

- **Problem:** Manage Users has Activate/Deactivate only. Managers cannot edit user details (username, display name, role) or delete accounts.
- **Goal:** Add Edit and Delete for user accounts in the Manage Users tab.

## Context

- Manage Users: `tythe_time_tracker/ui/pages/manager_dashboard.py` — `show_manage_users_tab()`
- Auth: `tythe_time_tracker/core/auth.py` — `create_user`, `get_all_users`, `set_user_active`, `set_user_pay_rates`
- Need: `update_user(user_id, username?, display_name?, role?, password?)` and `delete_user(user_id)`

## Steps

1. **user-edit-delete-01** — Auth: add `update_user(user_id, username, display_name, role, password=None)` and `delete_user(user_id)`. Cannot delete self.
2. **user-edit-delete-02** — Manage Users UI: per-user Edit button (expander/form: username, display_name, role, optional new password) and Delete button (with confirmation). Cannot edit/delete self.

## Key files

- `tythe_time_tracker/core/auth.py` — update_user, delete_user
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — show_manage_users_tab
