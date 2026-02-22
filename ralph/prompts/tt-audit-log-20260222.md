You are a Ralph Wiggum execution agent for the Tythe Barn Time Tracker. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-audit-log-20260222/plan.md`, `docs/working-memory/open/tt-audit-log-20260222/updates.md`, and `docs/working-memory/open/tt-audit-log-20260222/user_story.json`.

## Current story

**Story ID: {{STORY_ID}}**

Find this story in user_story.json. Implement its acceptance criteria in the Tythe Barn Time Tracker Streamlit app under `tythe_time_tracker/`. The app uses Supabase (PostgreSQL via psycopg2), Streamlit for UI, and has user authentication with `st.session_state.current_user` (from tt-user-auth task).

Key files to understand before making changes:
- `tythe_time_tracker/database/init.py` — database initialization and table DDL
- `tythe_time_tracker/database/repository.py` — data access layer
- `tythe_time_tracker/core/services.py` — business logic (add_shift_manually, edit_shift, delete_entry)
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — manager dashboard with tabs
- `tythe_time_tracker/core/auth.py` — authentication utilities (from auth task)

## Task

**Do ONE atomic change (or a small, cohesive set of changes for this story), commit, and stop.**

1. If the story is already implemented and verified, set `"passes": true` for that story in `docs/working-memory/open/tt-audit-log-20260222/user_story.json`, commit, and stop.
2. Otherwise, implement the next piece of work for story {{STORY_ID}}: add or modify files under `tythe_time_tracker/` as needed. One logical unit (e.g. one module, one DB change, one UI component).
3. Commit with conventional prefix: `feat(audit): <description>` or `fix(audit): <description>`.
4. Update `docs/working-memory/open/tt-audit-log-20260222/updates.md` with what you did and the story id.
5. If the story is now complete, set `"passes": true` for story {{STORY_ID}} in user_story.json and commit that change.
6. Run `git status` to confirm clean tree. STOP.

## Rules

- Work only in `tythe_time_tracker/` for this task. Do not change Ralph toolkit files.
- Use psycopg2 for database operations (consistent with existing codebase).
- Use JSONB columns for old_values/new_values to store structured before/after data.
- The `changed_by` field should be the username from `st.session_state.current_user['username']`.
- Commit after every atomic change. Update updates.md. Mark story passed when acceptance criteria are met.
