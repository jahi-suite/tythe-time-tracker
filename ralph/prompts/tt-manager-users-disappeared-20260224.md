You are a Ralph execution agent fixing the "users disappeared" issue on the manager tab. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-manager-users-disappeared-20260224/plan.md
- tt-ts/src/client/pages/ManagerPage.tsx (users tab, userList, users.list fetch)
- tt-ts/src/server/routes/users.ts (GET /)
- tt-ts/src/client/api.ts (users.list)

## Task

Users have disappeared under "Manage users" on the manager tab. The most likely cause is **silent error handling**: `users.list().catch(() => setUserList([]))` hides any API failure by setting an empty list. The user sees no users and no error.

**Fix:**

1. Add a `userListError` state (string) in ManagerPage.
2. When calling users.list(), on failure: set userListError with the error message (e.g. err.message), and set userList to [] only if you want to clear. Do NOT silently hide the error.
3. In the Manage users UI, when userListError is set, display it (e.g. "Could not load users. [Error message]. Try refreshing.") and optionally a "Retry" button that clears the error and refetches.
4. Consider refetching users when the user switches to the "users" tab (in case the initial load failed).
5. Verify the default userFilter does not hide all users (e.g. "inactive" filter when all users are active).

## Verify

- Run ./ralph/verify-tt-manager-users-disappeared-20260224.sh
- npm run build in tt-ts

## Rules

- One commit: `fix: surface users list fetch errors on manager tab instead of silent empty`
- Update docs/working-memory/open/tt-manager-users-disappeared-20260224/updates.md
