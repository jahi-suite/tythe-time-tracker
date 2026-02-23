You are a Ralph Wiggum execution agent for the Employee Portal (The Tythe Barn). Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-first-admin-ui-20260223/plan.md`, `docs/working-memory/open/tt-first-admin-ui-20260223/updates.md`, and `docs/working-memory/open/tt-first-admin-ui-20260223/user_story.json`.

## Current story

**Story ID: {{STORY_ID}}**

Target users (venue managers) are not tech-savvy. They should NOT have to edit Streamlit secrets to create the first admin account. When the users table is empty, show a simple "Set up your admin account" form on the login page: username, display name, password, confirm password. On submit, create the first manager and let them log in. No secrets required.

Key files:
- `tythe_time_tracker/ui/pages/login.py` — add first-admin form when table empty
- `tythe_time_tracker/database/init.py` — add `create_first_manager_from_ui()` or use `create_user()` from auth
- `tythe_time_tracker/core/auth.py` — `create_user()` exists

## Task

1. If the story is already implemented and verified, set `"passes": true` in user_story.json, commit, and stop.
2. Add a function to create the first manager when table is empty (no secrets). Can use auth.create_user with role='manager'.
3. On login page: detect empty users table, show "Set up your admin account" form. Fields: username, display name, password, confirm password. Validate password match. On success, create user, show success, rerun.
4. Keep or simplify the secrets-based expander (optional for advanced users).
5. Commit with prefix: `feat(auth): <description>`.
6. Update updates.md. STOP.

## Rules

- Work only in tythe_time_tracker/ for this task.
- Do not change Ralph toolkit files.
- First-time setup must work with zero config (just DB connection). No SEED_MANAGER secrets required.
