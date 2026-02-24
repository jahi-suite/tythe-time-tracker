# Task: tt-reject-incomplete-user-20260224

## Goal

User still sees "Logged in as: Unknown user" — the session has a user in DB but with empty display_name and username. Reject such users: treat them as invalid and return 401 so they are redirected to login.

## Root Cause

getAuthUserById returns users even when display_name and username are null/empty. The /me route then returns them, and the frontend shows "Unknown user" fallback. We should not allow incomplete users to stay authenticated.

## Fix

In tt-ts/src/server/auth/index.ts, inside getAuthUserById, after fetching the row:
- If `!row.display_name?.trim() && !row.username?.trim()` (both empty), return null.
- This causes /me to destroy session and return 401. AuthContext will set user=null, user gets redirected to login.

## Verification

- getAuthUserById returns null when display_name and username are both empty
- grep for the check in auth/index.ts
- npm run build passes
