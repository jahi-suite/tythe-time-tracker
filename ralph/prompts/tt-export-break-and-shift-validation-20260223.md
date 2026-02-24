You are a Ralph Wiggum execution agent. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read:
- docs/working-memory/open/tt-export-break-and-shift-validation-20260223/plan.md
- docs/working-memory/open/tt-export-break-and-shift-validation-20260223/updates.md

## Task

Implement the **next uncompleted story** from the plan. Do ONE story per iteration.

**Check updates.md** to see what's done. Pick the next story in order:

**Part A (break clarity):** break-clarity-01 → break-clarity-05
**Part B (shift validation):** shift-val-01 → shift-val-04

## Part A Summary

- Add "Break Deducted" column to exports (Excel + PDF, Python + TypeScript).
- For shifts of 6+ hours: show "20 min". For shorter: show "—".
- Add footer/note: "20 minutes unpaid break deducted for shifts of 6+ hours (deducted from majority rate type)."

## Part B Summary

- Add/Edit shift: validate employee name against users table (case-insensitive match on display_name).
- If no match: return error "Employee 'X' not found. Please use a name from the user list."
- On success: use canonical display_name from DB when saving (so "james" → "James").

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: feat: or fix:
- Update docs/working-memory/open/tt-export-break-and-shift-validation-20260223/updates.md when done.
