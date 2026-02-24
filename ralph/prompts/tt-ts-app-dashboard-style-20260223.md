You are a Ralph Wiggum execution agent applying dashboard style across the tt-ts app. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read:
- docs/working-memory/open/tt-ts-app-dashboard-style-20260223/plan.md
- docs/working-memory/open/tt-ts-app-dashboard-style-20260223/updates.md
- tt-ts/src/client/index.css (Manage Users styles: stat-card, user-card, user-cards-grid, badge)
- The page(s) relevant to the next story

## Task

Implement the **next uncompleted story** from the plan. Do ONE story per iteration.

**Check updates.md** to see what's done. Pick the next style-XX story in order (style-01 through style-09).

## Reference (Manage Users)

Copy patterns from ManagerPage Manage Users tab:
- .stat-card, .stat-value, .stat-label
- .user-cards-grid (or .cards-grid)
- .user-card (or .shift-card, .audit-card)
- .badge, .badge-role-*, .badge-status-*
- .manage-users-toolbar (search + filter)

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: feat(tt-ts): or style(tt-ts):
- Do NOT modify tythe_time_tracker/ — only tt-ts/
- Preserve all existing behavior; this is a visual/layout refactor only.
- Update docs/working-memory/open/tt-ts-app-dashboard-style-20260223/updates.md when done.
