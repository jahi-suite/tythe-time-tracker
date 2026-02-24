# Task: tt-logged-in-as-empty-20260224

## Goal

User sees "Logged in as: ()" with empty display name but role "employee" — a "non-user" state. Fix so either:
1. Incomplete session data is rejected (401, redirect to login), or
2. User is always shown with a valid identifier (display_name, username, or fallback).

## Root Cause

Session may contain stale or incomplete user data (empty display_name/username) — from session store serialization, corrupt session, or a user in DB with null display_name. GET /api/auth/me returns whatever is in req.session.user without validating or re-fetching from DB.

## Key Files

- tt-ts/src/server/routes/auth.ts — GET /me
- tt-ts/src/server/auth/index.ts — need a getAuthUserById(id) to re-fetch from DB
- tt-ts/src/client/pages/Layout.tsx — "Logged in as: {user?.display_name} ({user?.role})"

## Implementation

### 1. Backend: Validate /me and re-fetch from DB

- Add `getAuthUserById(id: string): Promise<AuthUser | null>` in auth/index.ts — fetches id, username, role, display_name from users table where id=$1 and active=true.
- In GET /me: if req.session?.user exists, call getAuthUserById(session.user.id). If null, clear session and return 401. If found, return the fresh user (overwrite session.user with it so future requests have complete data).
- This ensures /me never returns incomplete or stale session data.

### 2. Frontend: Fallback display

- In Layout.tsx: change `{user?.display_name} ({user?.role})` to `{user?.display_name || user?.username || 'Unknown user'} ({user?.role})` so we never show empty.
- Apply same fallback anywhere else we show user identity (ClockPage, TimesheetPage, etc.).

## Verification

- User with valid display_name/username shows correctly
- User with incomplete session gets 401 and re-directed to login
- npm run build succeeds
