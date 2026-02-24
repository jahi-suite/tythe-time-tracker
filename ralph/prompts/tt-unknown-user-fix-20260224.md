You are a Ralph execution agent. Fix "Logged in as: Unknown user ()" when admin logs in. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-unknown-user-fix-20260224/plan.md
- tt-ts/src/server/auth/index.ts
- tt-ts/src/client/pages/Layout.tsx
- tt-ts/src/server/db/migrate.ts

## Task

### Step 1: Harden SQL COALESCE (auth/index.ts)

In both `authenticateUser` and `getAuthUserById`, change the COALESCE to:
```sql
COALESCE(NULLIF(TRIM(display_name), ''), NULLIF(TRIM(username), ''), 'User') AS display_name
```

### Step 2: Harden username in getAuthUserById

In getAuthUserById SELECT, add COALESCE for username:
```sql
COALESCE(NULLIF(TRIM(username), ''), 'user') AS username
```

So both display_name and username are guaranteed non-empty.

### Step 3: Layout defensive fallback (Layout.tsx)

Change line 15 from:
```ts
const displayName = user?.display_name || user?.username || 'Unknown user'
```
to:
```ts
const displayName = (user?.display_name?.trim() || user?.username?.trim() || 'User').trim() || 'User'
```

Never show "Unknown user"; use 'User' as final fallback.

### Step 4: Migration (migrate.ts)

Update the fix-users migration to use the stronger COALESCE:
```sql
COALESCE(NULLIF(TRIM(display_name), ''), NULLIF(TRIM(username), ''), 'User')
```
Only update display_name. Do NOT change username (would break login).

### Step 5: Verify

Run ./ralph/verify-tt-unknown-user-fix-20260224.sh
npm run build in tt-ts

### Step 6: Trigger deploy

Add a small comment in Layout.tsx (e.g. "deploy trigger") so Netlify runs a full build.

## Rules

- One commit: `fix: ensure admin never shows Unknown user (COALESCE, Layout fallback)`
- Update docs/working-memory/open/tt-unknown-user-fix-20260224/updates.md
- Do NOT skip verification. Run the verify script before committing.
