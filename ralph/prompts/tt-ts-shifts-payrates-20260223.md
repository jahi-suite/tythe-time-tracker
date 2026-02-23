You are a Ralph Wiggum execution agent for the Tythe Barn Employee Portal. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-ts-shifts-payrates-20260223/plan.md` and `docs/working-memory/open/tt-ts-shifts-payrates-20260223/updates.md`.

## Task

Implement the next uncompleted story from the plan. Do ONE story per iteration.

**shifts-01**: Add Edit and Delete buttons to each entry in View All Entries. Clicking Edit: switch to Edit tab, set editShiftEntryId, load shift via shifts.get(), populate editShiftForm, set editShiftLoadedId. Clicking Delete: switch to Delete tab, set deleteShiftEntryId.

**shifts-02**: When Edit tab is shown and editShiftEntryId is set (from row click), auto-load the shift on mount/effect so user doesn't need to click "Load Shift".

**payrates-01**: In Manage Users, for each user add expander "Pay rates — {display_name}" with Standard £/hr, Enhanced £/hr, Supervisor £/hr number inputs. Save calls users.setPayRates(id, { standard, enhanced, supervisor }). User interface has standard_rate, enhanced_rate, supervisor_rate from users.list().

## Reference

- `tt-ts/src/client/pages/ManagerPage.tsx` — main file to edit
- `tt-ts/src/client/api.ts` — shifts.get, shifts.edit, shifts.delete, users.setPayRates
- Streamlit: `tythe_time_tracker/ui/pages/manager_dashboard.py` (pay rates lines 531–571, Edit/Delete per row 141–146)

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: `feat(tt-ts):`
- Update updates.md when done.
- Verification: `cd tt-ts && npm run build`
