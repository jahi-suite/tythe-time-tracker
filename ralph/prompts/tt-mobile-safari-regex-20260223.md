You are a Ralph Wiggum execution agent for the Employee Portal (The Tythe Barn). Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-mobile-safari-regex-20260223/plan.md`, `docs/working-memory/open/tt-mobile-safari-regex-20260223/updates.md`, and `docs/working-memory/open/tt-mobile-safari-regex-20260223/user_story.json`.

## Current story

**Story ID: {{STORY_ID}}**

The app crashes on mobile Safari with `SyntaxError: Invalid regular expression: invalid group specifier name`. This is a known Streamlit/Safari compatibility issue (Safari ≤ 16.3). Mitigate by upgrading Streamlit and documenting supported browsers.

Key files:
- `requirements.txt` — Streamlit version
- `README.md` — supported browsers
- `tythe_time_tracker/ui/components/footer.py` — optional browser hint

## Task

1. If the story is already implemented and verified, set `"passes": true` in user_story.json, commit, and stop.
2. Implement the current story per its acceptance criteria.
3. Commit with prefix: `fix(mobile):` or `docs:` as appropriate.
4. Update updates.md. STOP.

## Rules

- Do not break the app. Verify it still runs after changes.
- Streamlit officially supports Safari 16.6+. We document this for users on older Safari.
