# Task: tt-manager-users-disappeared-20260224

## Goal

Users have disappeared under "Manage users" on the manager tab. Diagnose and fix so the user list displays correctly.

## Likely Causes

1. **Silent error handling** — `users.list().catch(() => setUserList([]))` hides any API failure (401, 500, network) by setting an empty list. User sees no users and no error message.
2. **API failure** — GET /api/users may return 401 (session), 500 (DB), or 403 (CSRF). Need to surface the error.
3. **Filter state** — `userFilter` or `userSearch` may be hiding all users (e.g. filter set to "inactive" when all are active).
4. **Data** — Users may actually be missing from DB (migration, different DB in prod).

## Key Files

- tt-ts/src/client/pages/ManagerPage.tsx — fetch users.list(), catch sets [], filters
- tt-ts/src/client/api.ts — users.list() → GET /users
- tt-ts/src/server/routes/users.ts — GET /, requireManager, auth.getAllUsers()

## Implementation Hints

1. **Surface fetch errors** — When users.list() fails, set an error state and display it (e.g. "Could not load users. Try refreshing.") instead of silently setting empty list.
2. **Refresh on tab switch** — When user switches to "users" tab, optionally refetch to ensure fresh data.
3. **Check filters** — Ensure default filter state doesn't hide all users; consider "All" or "Active" as default.
4. **Verify API** — Ensure GET /api/users returns correctly for manager/admin; check requireManager allows access.

## Verification

- Manager tab → Manage users: user list displays (or shows clear error if API fails)
- npm run build succeeds
