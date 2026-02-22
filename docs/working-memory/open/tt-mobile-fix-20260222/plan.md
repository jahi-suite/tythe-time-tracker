# Task: tt-mobile-fix-20260222

> Created: 2026-02-22 | Status: planning
> Stories: [user_story.json](./user_story.json)

## What and why

- **Current:** The Streamlit app shows a blank screen on some mobile phones. The page does not load at all on certain devices/browsers.
- **Target:** App loads reliably on all modern mobile browsers (Chrome, Safari, Firefox on iOS and Android). Proper viewport meta tag, Streamlit config optimized for mobile, responsive layout adjustments.
- **Why:** Employees need to clock in/out from their phones. A blank screen makes the app unusable on mobile.

## Context

- App is Streamlit-based. Main entry: `tythe_time_tracker/ui/app.py` with `st.set_page_config(layout="wide")`.
- No `.streamlit/config.toml` exists currently.
- No custom CSS or viewport meta tags injected.
- Streamlit's `layout="wide"` can cause issues on narrow mobile screens.
- Blank screen on mobile is a known Streamlit issue often caused by: missing viewport meta, CORS/XSRF config, outdated Streamlit version, or `layout="wide"` on small screens.
- Current Streamlit version pin: `streamlit>=1.28.0` in requirements.txt.
- This task is independent — can run in parallel with other tasks.
- Run stories in order: mobile-01 through mobile-04.

## Verification command

Combined check: config file exists, viewport meta present, app starts.

```bash
test -f .streamlit/config.toml && \
grep -q "viewport" tythe_time_tracker/ui/app.py && \
echo "PASS" || echo "FAIL"
```

## Steps (by story)

1. **mobile-01** — Create `.streamlit/config.toml` with settings optimized for mobile compatibility. Include `[server]` section with `enableCORS = false`, `enableXsrfProtection = false` (for mobile browsers behind proxies). Include `[browser]` section with `gatherUsageStats = false`. Include `[theme]` section if beneficial.
2. **mobile-02** — Inject viewport meta tag at the top of the app using `st.markdown()` with `unsafe_allow_html=True`. Use: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`. Place this as early as possible in the app rendering (in `ui/app.py` right after `set_page_config`).
3. **mobile-03** — Responsive layout adjustments. Remove or conditionally apply `layout="wide"` (use default centered layout which works better on mobile). Add custom CSS via `st.markdown` to: reduce padding on small screens, ensure buttons are tap-friendly (min 44px height), make sidebar collapsible/auto-hide on mobile. Use CSS media queries targeting screens under 768px.
4. **mobile-04** — Pin Streamlit to `streamlit>=1.32.0` in requirements.txt (versions after 1.31 have significant mobile rendering fixes). Verify the app imports and page config still work with the updated version constraint.

## Affected files

- `.streamlit/config.toml` (new)
- `tythe_time_tracker/ui/app.py` (viewport meta, layout changes, responsive CSS)
- `requirements.txt` (Streamlit version pin update)
