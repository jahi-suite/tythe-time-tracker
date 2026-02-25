# Task: tt-ts-corporate-polish-20260223

> Created: 2026-02-23 | Status: planning

## What and why

- **Current:** The tt-ts app is functional but feels utilitarian. Sidebar uses a dropdown for navigation; header is plain text; success/error messages are basic; First Setup page lacks the login page's polish.
- **Target:** A more corporate, professional, and trustworthy appearance that matches the Streamlit app's polish. Build confidence with managers and employees.
- **Why:** The app handles pay and time data; it should feel reliable and enterprise-ready.

## Context

- tt-ts lives in `tt-ts/`. React frontend in `tt-ts/src/client/`.
- Key files: `Layout.tsx`, `LoginPage.tsx`, `index.css`, pages (ClockPage, TimesheetPage, ExportPage, ManagerPage).
- Streamlit app uses Tythe Barn palette: blues (#1f4e79, #163a5c), creams (#f7f9fc, #eef3f8), clean typography.
- Logos: `/tythe-logo.png`, `/kari-logo.png` (in public/ or served from root).
- Run stories in order: polish-01 through polish-05.

## Verification command

```bash
./ralph/verify-tt-ts-corporate-polish.sh
```

## Steps (by story)

1. **polish-01** — Header and branding. Add Tythe logo to the app header (Layout.tsx). Header should have a clear visual hierarchy: logo + "Employee Portal — The Tythe Barn". Use the corporate blue palette. Ensure header has sufficient padding and a subtle bottom border. Remove or relocate the Pay Rate Information details to a less prominent spot (e.g. sidebar or collapsible).

2. **polish-02** — Sidebar navigation. Replace the dropdown "Choose a page" with a vertical list of links (buttons or anchor-style links). Each page link should be clearly tappable (min 44px height on mobile). Active page should be visually indicated (e.g. background or border). Keep user info, logout, change password. Style the sidebar with the same corporate palette.

3. **polish-03** — Success, error, and info messages. Add CSS classes for `.message-success`, `.message-error`, `.message-info` with background colors and borders matching Streamlit (success: #edf7f2, error: #fbeff0, info: #eef5fc). Apply these to message displays in ClockPage, TimesheetPage, ExportPage, ManagerPage, and form feedback. Ensure text is readable (dark on light).

4. **polish-04** — Forms and inputs. Ensure all form inputs (text, password, select) have light background (#fff or #f4f7fb), dark text (#1e2a36), clear border (1–2px solid #d6dee8), and sufficient padding. Buttons: primary (blue bg) and secondary (light bg, blue border) with good contrast. First Setup page: add the same hero block and styling as LoginPage (eyebrow, title, subtitle).

5. **polish-05** — Cards, tables, and layout. Cards should have subtle shadow or border, rounded corners (10px), consistent padding. Tables: header row with #f4f7fb background, clear row borders. Ensure mobile responsiveness (grid-2 collapses, sidebar stacks). Footer: keep Kari logo + "Powered by Kari Suite", ensure it's visually balanced.

## Affected files

- `tt-ts/src/client/pages/Layout.tsx` (header, sidebar, footer)
- `tt-ts/src/client/pages/LoginPage.tsx` (FirstSetupPage styling)
- `tt-ts/src/client/index.css` (message classes, form styles, cards)
- `tt-ts/src/client/pages/ClockPage.tsx` (message styling)
- `tt-ts/src/client/pages/TimesheetPage.tsx` (if messages)
- `tt-ts/src/client/pages/ExportPage.tsx` (if messages)
- `tt-ts/src/client/pages/ManagerPage.tsx` (if messages)
