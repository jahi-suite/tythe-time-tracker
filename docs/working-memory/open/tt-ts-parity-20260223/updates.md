# Updates: tt-ts-parity-20260223

- Task created. Goal: bring tt-ts fully in line with Streamlit (Manager Add/Edit/Delete shifts, Manage Users full CRUD, Export quick options + role filter).
- 2026-02-23: Completed `parity-01` (Manager Add Shift form) in `tt-ts/src/client/pages/ManagerPage.tsx`. Added full manual add-shift form (employee, clock-in/out date+time, supervisor checkbox, pay rate override), client-side validation, `shifts.add()` submit flow, success/error messaging, and entry list refresh after submit. Replaced the shared add/edit/delete placeholder so only edit/delete remain as temporary placeholders for later stories.
