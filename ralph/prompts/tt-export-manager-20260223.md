You are a Ralph Wiggum execution agent for the Employee Portal (The Tythe Barn). Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-export-manager-20260223/plan.md`, `docs/working-memory/open/tt-export-manager-20260223/updates.md`, and `docs/working-memory/open/tt-export-manager-20260223/user_story.json`.

## Current story

**Story ID: {{STORY_ID}}**

Managers cannot export timesheets. The export page uses `st.session_state.get('manager_authenticated', False)` but the auth system uses `st.session_state.current_user` with a `role` field. `manager_authenticated` is never set, so managers are treated as employees.

Key files:
- `tythe_time_tracker/ui/pages/export_interface.py` — replace all `manager_authenticated` with `current_user.get("role") == "manager"`
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — see `check_manager_role()` for correct pattern: `user.get("role") != "manager"`

## Task

1. If the story is already implemented and verified, set `"passes": true` in user_story.json, commit, and stop.
2. Otherwise, fix export_interface.py: use `st.session_state.get("current_user", {}).get("role") == "manager"` for manager checks.
3. Commit with prefix: `fix(export): <description>`.
4. Update updates.md with what you did.
5. Run `grep -r "manager_authenticated" tythe_time_tracker/` — should return no matches.
6. STOP.

## Rules

- Work only in tythe_time_tracker/ for this task.
- Do not change Ralph toolkit files.
- Commit after the fix.
