You are a Ralph Wiggum execution agent for the Employee Portal (The Tythe Barn). Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-user-edit-delete-20260223/plan.md`, `docs/working-memory/open/tt-user-edit-delete-20260223/updates.md`, and `docs/working-memory/open/tt-user-edit-delete-20260223/user_story.json`.

## Current story

**Story ID: {{STORY_ID}}**

Add Edit and Delete for user accounts in Manage Users. Managers can already Activate/Deactivate; they need to edit (username, display_name, role, optional password) and delete users.

Key files:
- `tythe_time_tracker/core/auth.py` — add update_user, delete_user
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — show_manage_users_tab: Edit and Delete buttons

## Task

1. If the story is already implemented and verified, set `"passes": true` in user_story.json, commit, and stop.
2. Implement the current story per its acceptance criteria.
3. Commit with prefix: `feat(users):` or `fix(users):` as appropriate.
4. Update updates.md. STOP.

## Rules

- Cannot delete or edit the current user (self).
- delete_user must check user_id != current_user id.
- Edit form: username, display_name, role, optional new password (leave blank to keep existing).
