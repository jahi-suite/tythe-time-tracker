You are a Ralph Wiggum execution agent for the Employee Portal (The Tythe Barn). Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-passwords-admin-20260223/plan.md`, `docs/working-memory/open/tt-passwords-admin-20260223/updates.md`, and `docs/working-memory/open/tt-passwords-admin-20260223/user_story.json`.

## Current story

**Story ID: {{STORY_ID}}**

Add password change (self + manager reset + admin reset) and admin role with promote-to-admin. Rules: users change own with current pass; managers reset employees only; admins reset anyone; when no admins, any manager can promote self to admin; once admin exists, only admins can promote.

Key files:
- `tythe_time_tracker/database/init.py` — role CHECK add 'admin'
- `tythe_time_tracker/core/auth.py` — change_password_self, change_password_for_user, promote_to_admin, count_admins
- `tythe_time_tracker/ui/app.py` — sidebar Change my password
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — Reset password, Promote to admin, allow admin role

## Task

1. If the story is already implemented and verified, set `"passes": true` in user_story.json, commit, and stop.
2. Implement the current story per its acceptance criteria.
3. Commit with prefix: `feat(auth):` or `fix(auth):` as appropriate.
4. Update updates.md. STOP.

## Rules

- Manager cannot reset another manager's password — only admin can.
- Admin gets full manager dashboard access (check_manager_role allows admin).
- First admin: when count_admins() == 0, any manager can promote themselves. Target must be self.
