# Task: tt-kari-branding-20260222

> Created: 2026-02-22 | Status: planning
> Stories: [user_story.json](./user_story.json)

## What and why

- **Current:** No branding in the app. No indication of who powers/provides the software.
- **Target:** "Powered by Kari Suite" branding appears in the footer on every page AND prominently on the login page.
- **Why:** Brand visibility for Kari Suite across the application.

## Context

- App is Streamlit-based. Pages live in `tythe_time_tracker/ui/pages/`.
- Main app: `tythe_time_tracker/ui/app.py` — handles navigation and page routing.
- **Depends on tt-user-auth-20260222** — the login page must exist before we can add branding to it.
- Pages: employee_interface.py, personal_timesheet.py, export_interface.py, manager_dashboard.py.
- Custom HTML/CSS is injected via `st.markdown(unsafe_allow_html=True)`.
- No existing `tythe_time_tracker/ui/components/` directory — will need to create it.
- Run stories in order: brand-01 through brand-03.

## Verification command

```bash
grep -rl "Kari Suite" tythe_time_tracker/ | wc -l
# Should be >= 5 (footer.py + 4 page files or app.py)
```

## Steps (by story)

1. **brand-01** — Create footer component. New file `tythe_time_tracker/ui/components/__init__.py` (empty) and `tythe_time_tracker/ui/components/footer.py` with a `render_footer()` function. Uses `st.markdown()` with `unsafe_allow_html=True` to render styled "Powered by Kari Suite" text. Style: subtle, muted color, small font, centered, with a horizontal rule separator above. Add some bottom padding.
2. **brand-02** — Add footer to all pages. Import and call `render_footer()` at the bottom of every page render function: `employee_interface.py`, `personal_timesheet.py`, `export_interface.py`, `manager_dashboard.py`. The footer should appear after all page content.
3. **brand-03** — Login page branding. Add prominent "Powered by Kari Suite" on the login page (in `ui/app.py` or wherever the login form is rendered after auth task). Larger font than the footer version, centered, placed below the login form. Include the app title "The Tythe Barn - Time Tracker" and "Powered by Kari Suite" together in a branded layout.

## Affected files

- `tythe_time_tracker/ui/components/__init__.py` (new, empty)
- `tythe_time_tracker/ui/components/footer.py` (new: render_footer function)
- `tythe_time_tracker/ui/pages/employee_interface.py` (add footer call)
- `tythe_time_tracker/ui/pages/personal_timesheet.py` (add footer call)
- `tythe_time_tracker/ui/pages/export_interface.py` (add footer call)
- `tythe_time_tracker/ui/pages/manager_dashboard.py` (add footer call)
- `tythe_time_tracker/ui/app.py` (login page branding)
