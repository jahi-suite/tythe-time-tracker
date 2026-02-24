# Task: tt-ts-app-dashboard-style-20260223

> Created: 2026-02-23 | Status: in progress

## Goal

Apply the Manage Users dashboard style across the whole tt-ts app. Reference style: stat cards, card grids, badges, search/filter toolbars, responsive layout, clear button hierarchy, consistent spacing/typography.

## Stories (in order)

1. **style-01** — Shared CSS tokens and base card styles (stat-card, page-dashboard, cards-grid)
2. **style-02** — ClockPage dashboard (stat cards, card grid)
3. **style-03** — TimesheetPage dashboard (stat cards, styled table/cards)
4. **style-04** — ExportPage dashboard (stat cards, card grid)
5. **style-05** — ManagerPage View All Entries: card grid (shift cards, no ul/li)
6. **style-06** — ManagerPage Audit Log: card grid (audit cards, no ul/li)
7. **style-07** — ManagerPage Add/Edit/Delete forms: card polish
8. **style-08** — Layout sidebar polish (dashboard card style)
9. **style-09** — Final build and visual consistency pass

## Verification

```bash
./ralph/verify-tt-ts-app-dashboard-style.sh
```

## Key Files

- tt-ts/src/client/index.css
- tt-ts/src/client/pages/ClockPage.tsx
- tt-ts/src/client/pages/TimesheetPage.tsx
- tt-ts/src/client/pages/ExportPage.tsx
- tt-ts/src/client/pages/ManagerPage.tsx
- tt-ts/src/client/pages/Layout.tsx
