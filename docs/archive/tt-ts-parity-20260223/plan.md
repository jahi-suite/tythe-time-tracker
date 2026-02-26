# Task: tt-ts-parity-20260223

> Created: 2026-02-23 | Status: in progress
> Goal: Bring tt-ts fully in line with Streamlit app

## Summary

Implement all missing tt-ts UI features so it matches the Streamlit app. Backend APIs exist; focus is on React forms and UX.

## Reference

- Streamlit manager: `tythe_time_tracker/ui/pages/manager_dashboard.py`
- Streamlit export: `tythe_time_tracker/ui/pages/export_interface.py`
- tt-ts manager: `tt-ts/src/client/pages/ManagerPage.tsx`
- tt-ts export: `tt-ts/src/client/pages/ExportPage.tsx`
- tt-ts API client: `tt-ts/src/client/api.ts` (shifts.add/edit/delete/get, users.*)

## Stories (one per iteration)

### Manager Dashboard

1. **parity-01 Add Shift form** — Replace placeholder with full form: employee name, clock-in date/time, clock-out date/time (optional), supervisor checkbox, pay rate override (Auto/Standard/Enhanced/Supervisor). Call `shifts.add()`. Match Streamlit `show_add_shift_tab()`.

2. **parity-02 Edit Shift form** — Entry ID input, fetch shift via `shifts.get(id)`, show form with pre-filled values. Call `shifts.edit()`. Match Streamlit `show_edit_shift_tab()`.

3. **parity-03 Delete Entry form** — Entry ID input, confirm, call `shifts.delete()`. Match Streamlit `show_delete_entry_tab()`.

4. **parity-04 Manage Users: Create** — Create New User form: username, display name, password, role (employee/manager/admin for admins). Call `users.create()`.

5. **parity-05 Manage Users: Edit** — Per-user Edit: username, display name, role, optional new password. Call `users.update()`. Cannot edit self.

6. **parity-06 Manage Users: Activate/Deactivate** — Activate/Deactivate buttons per user. Call `users.activate()` / `users.deactivate()`. Cannot deactivate self.

7. **parity-07 Manage Users: Reset Password** — Per-user Reset Password (admins: all; managers: employees only). Call `users.resetPassword()`.

8. **parity-08 Manage Users: Promote to admin** — Promote to admin button (first admin: manager promotes self; after: admin promotes managers). Call `users.promoteAdmin()`.

9. **parity-09 Manage Users: Delete** — Delete user with confirmation. Call `users.delete()`. Cannot delete self.

10. **parity-10 View All Entries: totals** — Per-staff expandable sections with Standard/Enhanced/Supervisor hour totals. Use `split_shift_by_rate` logic (backend has it; may need shared util or API).

11. **parity-11 View All Entries: Edit/Delete per row** — Edit and Delete buttons per entry, switch to Edit/Delete tab with ID pre-filled.

### Export Page

12. **parity-12 Export: quick date options** — Add select: Custom Range, This Week, Last Week, This Month. Compute start/end from option.

13. **parity-13 Export: role filter** — For managers: Filter by Role (All Roles, Staff Only, Supervisors Only). Add `roleFilter` to export API if needed; otherwise filter client-side after fetch.

## Verification

```bash
cd tt-ts && npm run build
```

Plus parity checks (run `ralph/verify-tt-ts-parity.sh`):

- ManagerPage does NOT contain "Full add/edit/delete forms would go here"
- ManagerPage Manage Users has Create User form
- ManagerPage has Add Shift form with employee, clock-in, clock-out fields

## Rules

- One story per iteration; commit after each.
- Conventional commits: feat(tt-ts):
- Do NOT modify `tythe_time_tracker/` or Streamlit app.
- Update `docs/working-memory/open/tt-ts-parity-20260223/updates.md` when done.
