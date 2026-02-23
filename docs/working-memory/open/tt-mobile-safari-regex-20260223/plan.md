# Task: tt-mobile-safari-regex-20260223

> Created: 2026-02-23 | Status: in progress
> Stories: [user_story.json](./user_story.json)

## What and why

- **Problem:** App crashes on mobile (Safari) with `SyntaxError: Invalid regular expression: invalid group specifier name`. Stack trace mentions `containsMathSyntax`, `useMemo`. Affects karisuitetythe.streamlit.app on iPhone.
- **Cause:** Known Streamlit issue — Safari ≤ 16.3 doesn't support regex syntax used in Streamlit's frontend. Streamlit officially supports Safari 16.6+ only.
- **Goal:** Mitigate or work around so app loads on as many mobile devices as possible.

## Context

- Streamlit GitHub #8603, #6092: same error, "upgrade Safari to 16.6" is official answer.
- We cannot change users' Safari version. Options: upgrade Streamlit (in case of fix), add config, or show a fallback message.
- App: `tythe_time_tracker/ui/app.py`, `.streamlit/config.toml`, `requirements.txt`

## Steps

1. **safari-regex-01** — Pin Streamlit to latest (e.g. `streamlit>=1.39.0` or current). Check release notes for Safari fixes. Update requirements.txt.
2. **safari-regex-02** — Add user-facing guidance: if app fails to load on mobile, show a static HTML error page or add README note: "For best mobile experience use Chrome or Safari 16.6+". Consider `st.exception` or early JS detection — Streamlit may not render at all, so a separate "unsupported browser" page may need to be the app's first paint (complex). Simpler: document in README and add a note in the app's footer or login page for supported browsers.
3. **safari-regex-03** — Verify: app still runs locally and on Streamlit Cloud. README documents Safari 16.6+ requirement for mobile.

## Key files

- `requirements.txt` — Streamlit version
- `README.md` — supported browsers note
- `tythe_time_tracker/ui/components/footer.py` — optional "Best viewed in Chrome or Safari 16.6+" hint
