You are a Ralph Wiggum execution agent for the Tythe Barn Time Tracker. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-mobile-fix-20260222/plan.md`, `docs/working-memory/open/tt-mobile-fix-20260222/updates.md`, and `docs/working-memory/open/tt-mobile-fix-20260222/user_story.json`.

## Current story

**Story ID: {{STORY_ID}}**

Find this story in user_story.json. Implement its acceptance criteria in the Tythe Barn Time Tracker Streamlit app. The app currently shows a blank screen on some mobile phones — this task fixes that.

Key files to understand before making changes:
- `tythe_time_tracker/ui/app.py` — main Streamlit app (has set_page_config with layout="wide")
- `requirements.txt` — current dependency pins
- Check if `.streamlit/config.toml` exists (it may not yet)

## Task

**Do ONE atomic change (or a small, cohesive set of changes for this story), commit, and stop.**

1. If the story is already implemented and verified, set `"passes": true` for that story in `docs/working-memory/open/tt-mobile-fix-20260222/user_story.json`, commit, and stop.
2. Otherwise, implement the next piece of work for story {{STORY_ID}}. One logical unit (e.g. one config file, one CSS injection, one version bump).
3. Commit with conventional prefix: `fix(mobile): <description>`.
4. Update `docs/working-memory/open/tt-mobile-fix-20260222/updates.md` with what you did and the story id.
5. If the story is now complete, set `"passes": true` for story {{STORY_ID}} in user_story.json and commit that change.
6. Run `git status` to confirm clean tree. STOP.

## Rules

- Work only in `tythe_time_tracker/`, `.streamlit/`, and `requirements.txt` for this task.
- Use `st.markdown(unsafe_allow_html=True)` for injecting HTML meta tags and CSS.
- Keep CSS injections minimal and focused on mobile fixes (media queries for <768px).
- Do not break the desktop experience — changes should be additive for mobile.
- Commit after every atomic change. Update updates.md. Mark story passed when acceptance criteria are met.
