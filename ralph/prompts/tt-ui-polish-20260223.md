You are a Ralph Wiggum execution agent for the Tythe Barn Time Tracker. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-ui-polish-20260223/plan.md`, `docs/working-memory/open/tt-ui-polish-20260223/updates.md`, and `docs/working-memory/open/tt-ui-polish-20260223/user_story.json`.

## Current story

**Story ID: {{STORY_ID}}**

Find this story in user_story.json. Implement its acceptance criteria in the Tythe Barn Time Tracker Streamlit app. This task makes the UI more corporate, professional, and trustworthy.

Key files to understand before making changes:
- `tythe_time_tracker/ui/app.py` — main app, page config, global CSS
- `tythe_time_tracker/ui/pages/employee_interface.py` — clock in/out
- `tythe_time_tracker/ui/pages/personal_timesheet.py` — timesheet view
- `tythe_time_tracker/ui/pages/export_interface.py` — export page
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — manager dashboard
- `tythe_time_tracker/ui/pages/login.py` — login page
- `tythe_time_tracker/ui/components/footer.py` — Kari Suite footer
- `tythe_time_tracker/ui/components/logos.py` — Tythe + Kari logos (Tythe bigger, Kari smaller)
- Tythe Barn palette: thetythebarn.co.uk uses warm creams (#f8f6f3), sage greens (#5c6b4a), earthy tones. Avoid stark white.

## Task

**Do ONE atomic change (or a small, cohesive set of changes for this story), commit, and stop.**

1. If the story is already implemented and verified, set `"passes": true` for that story in `docs/working-memory/open/tt-ui-polish-20260223/user_story.json`, commit, and stop.
2. Otherwise, implement the next piece of work for story {{STORY_ID}}. One logical unit (e.g. theme CSS, one page's headers, layout tweaks).
3. Commit with conventional prefix: `feat(ui): <description>`.
4. Update `docs/working-memory/open/tt-ui-polish-20260223/updates.md` with what you did and the story id.
5. If the story is now complete, set `"passes": true` for story {{STORY_ID}} in user_story.json and commit that change.
6. Run `git status` to confirm clean tree. STOP.

## Rules

- Work only in `tythe_time_tracker/` for this task.
- Do not change Ralph toolkit files.
- Keep functionality identical — only visual/copy changes.
- Aim for corporate, professional, trustworthy appearance.
- Replace emoji-heavy labels with clean text where appropriate.
- Preserve mobile responsiveness and existing Kari Suite branding.
- polish-05: Login inputs must be clearly visible (light bg, clear border). Login button readable. Use Tythe Barn palette (warm, not stark white). Footer: Kari logo tiny, inline next to "Powered by Kari Suite" text only. Login top: Tythe logo only (no Kari).
- Commit after every atomic change. Update updates.md. Mark story passed when acceptance criteria are met.
