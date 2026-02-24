You are a Ralph execution agent. Fix "Unknown user" by rejecting incomplete users. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-reject-incomplete-user-20260224/plan.md
- tt-ts/src/server/auth/index.ts (getAuthUserById function)

## Task

In getAuthUserById, after we fetch the row and before we return the user object:
- If both display_name and username are empty (null, undefined, or whitespace-only), return null.
- Add: `if (!row.display_name?.trim() && !row.username?.trim()) return null`
- This ensures incomplete users get 401 from /me and are redirected to login.

## Verify

- Run ./ralph/verify-tt-reject-incomplete-user-20260224.sh
- npm run build in tt-ts

## Rules

- One commit: `fix: reject users with empty display_name and username in getAuthUserById`
- Update docs/working-memory/open/tt-reject-incomplete-user-20260224/updates.md
