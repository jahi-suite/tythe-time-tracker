# Task: tt-ts-shifts-payrates-20260223

> Created: 2026-02-23 | Status: in progress
> Goal: Easier shift edit/delete + pay rates editing in tt-ts

## Summary

1. **Easier shift editing**: Add Edit and Delete buttons directly on each entry in View All Entries. Clicking Edit switches to Edit tab with ID pre-filled and auto-loads the shift. Clicking Delete switches to Delete tab with ID pre-filled (or inline confirm + delete).
2. **Pay rates editing**: Add per-user pay rates form in Manage Users (Standard £/hr, Enhanced £/hr, Supervisor £/hr) with Save button. API: `users.setPayRates(id, { standard, enhanced, supervisor })`.

## Reference

- tt-ts ManagerPage: `tt-ts/src/client/pages/ManagerPage.tsx`
- Streamlit pay rates: `tythe_time_tracker/ui/pages/manager_dashboard.py` lines 531–571 (expander with number inputs)
- Streamlit Edit/Delete per row: `tythe_time_tracker/ui/pages/manager_dashboard.py` lines 141–146 (Edit/Delete buttons on each entry)
- API: `users.setPayRates(id, { standard?, enhanced?, supervisor? })` — users.list() returns `standard_rate`, `enhanced_rate`, `supervisor_rate`

## Stories (one per iteration)

### shifts-01: Edit/Delete buttons on View All Entries

Add Edit and Delete buttons to each entry row in the View All Entries list. When Edit clicked: switch to Edit tab (`setTab('edit')`), set `editShiftEntryId` to entry.id, call `shifts.get(entry.id)` to load the form, populate `editShiftForm`, set `editShiftLoadedId`. When Delete clicked: switch to Delete tab, set `deleteShiftEntryId` to entry.id. User can then click Delete Entry to confirm (or add inline confirm).

### shifts-02: Auto-load shift when switching to Edit tab with ID

When Edit tab is shown and `editShiftEntryId` is set (e.g. from clicking Edit on a row), auto-load the shift via `shifts.get()` and populate the form. No need to click "Load Shift" — it loads on tab switch.

### payrates-01: Pay rates form in Manage Users

For each user in Manage Users, add an expander "Pay rates — {display_name}" with three number inputs: Standard £/hr, Enhanced £/hr, Supervisor £/hr. Pre-fill from `user.standard_rate`, `user.enhanced_rate`, `user.supervisor_rate`. Save button calls `users.setPayRates(user.id, { standard, enhanced, supervisor })`. Show success/error. Ensure users.list() returns rate fields (check API).

## Verification

```bash
cd tt-ts && npm run build
```

- ManagerPage View All Entries has Edit and Delete buttons per entry
- ManagerPage Manage Users has pay rates expander per user with Standard/Enhanced/Supervisor inputs and Save

## Rules

- One story per iteration; commit after each.
- Conventional commits: `feat(tt-ts):`
- Update `docs/working-memory/open/tt-ts-shifts-payrates-20260223/updates.md` when done.
