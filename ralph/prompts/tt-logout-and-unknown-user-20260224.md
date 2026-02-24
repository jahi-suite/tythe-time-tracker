You are a Ralph execution agent. Fix logout destination and tighten unknown-user rejection. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-logout-and-unknown-user-20260224/plan.md
- tt-ts/src/client/pages/Layout.tsx
- tt-ts/src/server/auth/index.ts (getAuthUserById)

## Task

### 1. Logout → /login

In Layout.tsx, in handleLogout, change `navigate('/')` to `navigate('/login')` so after logout the user goes to the login page, not the marketing page.

### 2. Stricter incomplete-user check

In getAuthUserById (auth/index.ts), change the check from:
- `if (!row.display_name?.trim() && !row.username?.trim()) return null`
to:
- `if (!row.display_name?.trim() || !row.username?.trim()) return null`

Reject if EITHER display_name OR username is empty. Require both to be non-empty.

## Verify

- Run ./ralph/verify-tt-logout-and-unknown-user-20260224.sh
- npm run build in tt-ts

## Rules

- One commit: `fix: logout to /login and reject users missing display_name or username`
- Update docs/working-memory/open/tt-logout-and-unknown-user-20260224/updates.md
