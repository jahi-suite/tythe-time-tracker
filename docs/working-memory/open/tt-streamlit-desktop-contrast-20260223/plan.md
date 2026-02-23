# Task: tt-streamlit-desktop-contrast-20260223

> Created: 2026-02-23 | Status: planning

## What and why

- **Current:** On desktop, the Streamlit app has low-contrast text in form controls. Export Type dropdown shows dark grey text on dark charcoal background (nearly invisible). Some buttons may have similar issues.
- **Target:** Selectboxes, buttons, and form controls are readable on desktop with high contrast (light background + dark text).
- **Why:** Mobile looks fine; desktop users cannot read the Export Type dropdown and other controls.

## Context

- App is Streamlit-based. Main CSS in `tythe_time_tracker/ui/app.py` via `st.markdown(..., unsafe_allow_html=True)`.
- Streamlit selectbox uses Base Web components with `[data-baseweb="select"]`. Current selectors `.stSelectbox div` and `[data-testid="stSelectbox"] > div > div` may not target the actual displayed-value element on desktop.
- Use `@media (min-width: 769px)` so mobile (which works) is unchanged.
- Run stories in order: contrast-01, contrast-02, contrast-03.

## Verification command

```bash
./ralph/verify-tt-streamlit-desktop-contrast.sh
```

## Steps (by story)

1. **contrast-01** — Add `@media (min-width: 769px)` block in `app.py` CSS. Target `.stSelectbox`, `[data-testid="stSelectbox"]`, and `[data-baseweb="select"]` (and descendants). Force `background-color: #ffffff` or `#f4f7fb` and `color: #1e2a36 !important` on the select input/display area so the selected value is readable.
2. **contrast-02** — Ensure buttons in the desktop block have sufficient contrast (`.stButton > button` with dark text on light bg). Current button CSS may already be fine; verify and add overrides if needed.
3. **contrast-03** — Apply same light-bg + dark-text pattern to `.stTextInput`, `.stDateInput`, `.stTimeInput`, `.stNumberInput`, `.stTextArea` inside the desktop media query if they exhibit low contrast.

## Affected files

- `tythe_time_tracker/ui/app.py` (CSS in setup_page_config)
