You are a Ralph Wiggum execution agent implementing the 6-hour break deduction rule. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read:
- docs/working-memory/open/tt-break-deduction-20260223/plan.md
- docs/working-memory/open/tt-break-deduction-20260223/updates.md
- export_functions.py (split_shift_by_rate, calculate_staff_summary)
- tt-ts/src/server/services/exportUtils.ts (splitShiftByRate, calculateStaffSummary)

## Task

Implement the **next uncompleted story** from the plan. Do ONE story per iteration.

**Check updates.md** to see what's done. Pick the next break-XX story in order (break-01 through break-05).

## Break Rule Summary

- 6+ hours worked → 20-minute unpaid break
- Deduct from Standard first, then Supervisor. NEVER from Enhanced.
- Mixed shifts: only Standard (and Supervisor if applicable) reduced.
- Pure Enhanced: no deduction.

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: feat: or fix:
- Update docs/working-memory/open/tt-break-deduction-20260223/updates.md when done.
