# Updates: tt-manager-users-disappeared-20260224

## Progress

(Agent will update after each iteration)

- 2026-02-24: Fixed manager "Manage users" silent failure path by adding `userListError` state and shared `loadUsers()` fetch helper in `ManagerPage`. Users fetch failures now surface a visible error with retry instead of silently showing an empty list.
- 2026-02-24: Added users-tab refetch on tab switch and replaced repeated `users.list().catch(() => setUserList([]))` refresh calls (create/edit/activate/deactivate/pay-rates/user-card refresh) with the shared loader.
- 2026-02-24: Verified with `./ralph/verify-tt-manager-users-disappeared-20260224.sh` (PASS) and `npm run build` in `tt-ts` (client + server build completed; Vite emitted existing dynamic-import warnings only).
