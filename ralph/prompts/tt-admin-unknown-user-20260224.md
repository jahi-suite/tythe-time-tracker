You are a Ralph execution agent. Fix admin login showing "Unknown user". Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-admin-unknown-user-20260224/plan.md
- tt-ts/src/server/auth/index.ts (authenticateUser, getAuthUserById)

## Task

Admin login returns a user with empty display_name, so Layout shows "Logged in as: Unknown user ()".

Fix: Use COALESCE in the SQL SELECT so we never return empty display_name.

### authenticateUser

Change the SELECT from:
```
SELECT id, username, password_hash, role, display_name
```
to:
```
SELECT id, username, password_hash, role,
  COALESCE(NULLIF(TRIM(display_name), ''), username, 'User') AS display_name
```

Use the aliased display_name in the return object.

### getAuthUserById

Change the SELECT from:
```
SELECT id, username, role, display_name
```
to:
```
SELECT id, username, role,
  COALESCE(NULLIF(TRIM(display_name), ''), username, 'User') AS display_name
```

Use the aliased display_name in the return object.

## Verify

- Run ./ralph/verify-tt-admin-unknown-user-20260224.sh
- npm run build in tt-ts

## Rules

- One commit: `fix: use COALESCE for display_name so admin never shows Unknown user`
- Update docs/working-memory/open/tt-admin-unknown-user-20260224/updates.md
