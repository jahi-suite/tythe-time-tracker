# Task: tt-ts-manage-users-dashboard-20260223

> Created: 2026-02-23 | Status: in progress

## Goal

Transform the Manage Users tab from a bullet list into a modern card-based admin dashboard with search, filter, summary stats, badges, and clear visual hierarchy.

## Stories (in order)

1. **mu-01** — Summary stats (Total Users, Active Users, Admin Users)
2. **mu-02** — Search and filter (by name/username, role/status dropdown)
3. **mu-03** — Card grid layout (responsive 2–3 columns)
4. **mu-04** — Role and status badges (color-coded pills)
5. **mu-05** — Group by role (Administrators / Team Members)
6. **mu-06** — Button hierarchy (Edit primary, Deactivate danger)
7. **mu-07** — Expandable pay rates inside card
8. **mu-08** — Avatar initials
9. **mu-09** — Layout polish

## Verification

```bash
./ralph/verify-tt-ts-manage-users-dashboard.sh
```

## Key Files

- tt-ts/src/client/pages/ManagerPage.tsx
- tt-ts/src/client/index.css
