# Task: tt-ui-polish-20260223

> Created: 2026-02-23 | Status: planning
> Stories: [user_story.json](./user_story.json)

## What and why

- **Current:** The app has a casual, emoji-heavy UI that feels informal.
- **Target:** A more corporate, professional, and trustworthy appearance suitable for business use.
- **Why:** Build confidence with managers and employees; the app should feel reliable and enterprise-ready.

## Context

- App is Streamlit-based. Pages live in `tythe_time_tracker/ui/pages/`.
- Main app: `tythe_time_tracker/ui/app.py` — page config, global styles.
- Components: `tythe_time_tracker/ui/components/footer.py` — Kari Suite footer.
- Pages: employee_interface.py, personal_timesheet.py, export_interface.py, manager_dashboard.py, login.py.
- Custom CSS is injected via `st.markdown(unsafe_allow_html=True)` in app.py and components.
- Run stories in order: polish-01 through polish-03.

## Verification command

```bash
# Check emoji usage is reduced (headers should not rely on emojis)
grep -r "st\.header\|st\.subheader" tythe_time_tracker/ui/ | grep -c "👤\|👑\|🟢\|🔴\|📊\|📋" || true
# After polish: should be 0 or minimal
```

## Steps (by story)

1. **polish-01** — Professional theme. In `app.py`: change page_icon from emoji to something professional (e.g. "⏱" or remove for default). Add global CSS for a corporate color palette (blues/grays, clean typography). Ensure error/success/info messages use professional styling. Keep mobile responsiveness from existing styles.
2. **polish-02** — Clean headers and labels. Replace emoji-heavy headers and button labels across pages (employee_interface, personal_timesheet, export_interface, manager_dashboard, login). Use professional text: "Employee Clock In/Out" instead of "👤 Employee Clock In/Out", "Clock In" / "Clock Out" instead of "🟢 Clock In" / "🔴 Clock Out", etc. Keep functionality identical.
3. **polish-03** — Layout and trust signals. Add subtle card-style containers or dividers where appropriate. Improve spacing and hierarchy. Ensure tables and forms have clean borders and readable layout. Add a subtle, professional header/branding block on the login page if it improves trust.

## Affected files

- `tythe_time_tracker/ui/app.py` (theme, page config, global CSS)
- `tythe_time_tracker/ui/pages/employee_interface.py` (headers, labels)
- `tythe_time_tracker/ui/pages/personal_timesheet.py` (headers, labels)
- `tythe_time_tracker/ui/pages/export_interface.py` (headers, labels)
- `tythe_time_tracker/ui/pages/manager_dashboard.py` (headers, labels)
- `tythe_time_tracker/ui/pages/login.py` (optional polish)
- `tythe_time_tracker/ui/components/footer.py` (optional alignment with theme)
