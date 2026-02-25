# Task: tt-ts-tabs-polish-20260223

> Created: 2026-02-23 | Status: planning

## What and why

- **Problem:** On the Manager Dashboard, inactive tabs are invisible until you hover over them. Only the hovered tab is readable. Root cause: `.tabs button` has `background: #fff` but inherits `color: #fff` from global button rule = white text on white background.
- **Target:** All tabs always visible with dark text on light background. Tab bar looks corporate and polished.
- **Why:** Users cannot see which tabs exist; the UI feels broken and unprofessional.

## Context

- [tt-ts/src/client/index.css](tt-ts/src/client/index.css) lines 295-297: `.tabs button` styling
- ManagerPage uses 6 tabs: View All Entries, Add Shift, Edit Shift, Delete Entry, Manage Users, Audit Log
- Corporate palette: --tt-primary, --tt-text (#1e2a36), --tt-border

## Verification command

```bash
./ralph/verify-tt-ts-tabs-polish.sh
```

## Steps (by story)

1. **tabs-01** — Fix contrast. Add `color: var(--tt-text)` to `.tabs button` so inactive tabs have dark, readable text. Add `.tabs button:hover:not(.active)` with subtle background (#f4f7fb) so hover is visible.
2. **tabs-02** — Polish. Give `.tabs` a light background (#f4f7fb), padding, border-radius. Ensure active tab remains clearly distinct. Tabs wrap cleanly on narrow screens.

## Affected files

- `tt-ts/src/client/index.css`
