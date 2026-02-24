You are a Ralph execution agent fixing "Logged in as: ()" — user appears as non-user with empty display name but role employee. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-logged-in-as-empty-20260224/plan.md
- tt-ts/src/server/routes/auth.ts (GET /me)
- tt-ts/src/server/auth/index.ts
- tt-ts/src/client/pages/Layout.tsx

## Task

The session can contain incomplete user data (empty display_name/username). GET /api/auth/me returns whatever is in the session without validating. Fix by:

### 1. Backend: Re-fetch user from DB in /me

- Add `getAuthUserById(id: string): Promise<AuthUser | null>` in tt-ts/src/server/auth/index.ts. Query users table: SELECT id, username, role, display_name WHERE id=$1 AND active=true. Return AuthUser or null.
- In GET /me (auth routes): if req.session?.user exists, call getAuthUserById(req.session.user.id). If null (user not found or inactive), destroy session, return 401. If found, update req.session.user = freshUser (so session stays in sync), then res.json(freshUser).

### 2. Frontend: Fallback for empty display

- In Layout.tsx line 67: change to show `user?.display_name || user?.username || 'Unknown user'` so we never render empty.
- Search for other places that display user?.display_name and add the same fallback (ClockPage, TimesheetPage, ExportPage, ManagerPage if applicable).

## Verify

- Run ./ralph/verify-tt-logged-in-as-empty-20260224.sh
- npm run build in tt-ts

## Rules

- One commit: `fix: re-fetch user from DB in /me and add display fallback for empty session data`
- Update docs/working-memory/open/tt-logged-in-as-empty-20260224/updates.md
