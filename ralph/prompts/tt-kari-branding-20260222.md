You are a Ralph Wiggum execution agent for the Tythe Barn Time Tracker. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-kari-branding-20260222/plan.md`, `docs/working-memory/open/tt-kari-branding-20260222/updates.md`, and `docs/working-memory/open/tt-kari-branding-20260222/user_story.json`.

## Current story

**Story ID: {{STORY_ID}}**

Find this story in user_story.json. Implement its acceptance criteria in the Tythe Barn Time Tracker Streamlit app. This task adds "Powered by Kari Suite" branding throughout the app.

Key files to understand before making changes:
- `tythe_time_tracker/ui/app.py` — main Streamlit app (login page lives here after auth task)
- `tythe_time_tracker/ui/pages/employee_interface.py` — employee clock in/out page
- `tythe_time_tracker/ui/pages/personal_timesheet.py` — personal timesheet view
- `tythe_time_tracker/ui/pages/export_interface.py` — export page
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — manager dashboard
- Check if `tythe_time_tracker/ui/components/` exists (may need to create it)

## Task

**Do ONE atomic change (or a small, cohesive set of changes for this story), commit, and stop.**

1. If the story is already implemented and verified, set `"passes": true` for that story in `docs/working-memory/open/tt-kari-branding-20260222/user_story.json`, commit, and stop.
2. Otherwise, implement the next piece of work for story {{STORY_ID}}. One logical unit (e.g. one new component file, one set of page modifications).
3. Commit with conventional prefix: `feat(branding): <description>`.
4. Update `docs/working-memory/open/tt-kari-branding-20260222/updates.md` with what you did and the story id.
5. If the story is now complete, set `"passes": true` for story {{STORY_ID}} in user_story.json and commit that change.
6. Run `git status` to confirm clean tree. STOP.

## Rules

- Work only in `tythe_time_tracker/` for this task.
- Use `st.markdown(unsafe_allow_html=True)` for HTML/CSS branding elements.
- Footer should be subtle (muted color, small font, centered) — not overwhelming.
- Login page branding should be more prominent (larger, centered, below form).
- Keep the branded text exactly as "Powered by Kari Suite" (capital K, capital S).
- Commit after every atomic change. Update updates.md. Mark story passed when acceptance criteria are met.
