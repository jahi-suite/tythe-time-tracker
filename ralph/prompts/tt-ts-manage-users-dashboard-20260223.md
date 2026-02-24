You are a Ralph Wiggum execution agent refactoring the Manage Users tab. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read:
- `docs/working-memory/open/tt-ts-manage-users-dashboard-20260223/plan.md`
- `docs/working-memory/open/tt-ts-manage-users-dashboard-20260223/updates.md`
- `tt-ts/src/client/pages/ManagerPage.tsx` (tab === 'users' section)
- `tt-ts/src/client/index.css`

## Task

Implement the **next uncompleted story** from the plan. Do ONE story per iteration.

**Check updates.md** to see what's done. Pick the next mu-XX story in order (mu-01 through mu-09).

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: `feat(tt-ts):` or `style(tt-ts):`
- Do NOT modify tythe_time_tracker/ — only tt-ts/
- Preserve all existing behavior (create, edit, deactivate, pay rates)
- Update `docs/working-memory/open/tt-ts-manage-users-dashboard-20260223/updates.md` when done.
