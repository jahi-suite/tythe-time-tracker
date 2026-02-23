# Task: tt-passwords-admin-20260223

> Created: 2026-02-23 | Status: in progress
> Stories: [user_story.json](./user_story.json)

## What and why

- **Problem:** Users cannot change their own passwords. Managers cannot reset employee passwords. No admin role — managers can't reset other managers' passwords. No way to bootstrap the first admin.
- **Goal:** Self-service password change; managers reset employee passwords; admin role for full control; first-admin bootstrap (any manager promotes self when no admins exist).

## Role hierarchy

- **Employee:** Change own password only (requires current password).
- **Manager:** Change own password; reset employee passwords (no current pass needed). Cannot reset other managers.
- **Admin:** Change own password; reset anyone's password (employees and managers). Promote managers to admin. When no admins exist, any manager can promote themselves to admin (one-time bootstrap). Once an admin exists, only admins can promote.

## Context

- Auth: `tythe_time_tracker/core/auth.py`
- DB: users.role CHECK currently `IN ('employee', 'manager')` — must add 'admin'
- Manage Users: `tythe_time_tracker/ui/pages/manager_dashboard.py`
- Access: `check_manager_role()` — should allow admin too

## Steps

1. **passwords-01** — DB: add 'admin' to role CHECK. Auth: change_password_self, change_password_for_user, promote_to_admin, count_admins. Admin gets manager dashboard access.
2. **passwords-02** — UI: Change my password (sidebar). Manage Users: Reset password, Promote to admin.

## Key files

- `tythe_time_tracker/database/init.py` — role CHECK migration
- `tythe_time_tracker/core/auth.py` — password and promote functions
- `tythe_time_tracker/ui/app.py` — sidebar Change my password
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — Reset password, Promote to admin
