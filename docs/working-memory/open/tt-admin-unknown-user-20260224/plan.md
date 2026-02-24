# Task: tt-admin-unknown-user-20260224

## Goal

Admin login shows "Logged in as: Unknown user ()" — fix so admin sees their name.

## Root Cause

DB user has empty or null `display_name` (and possibly `username`). Login succeeds but the returned user has empty identifiers, so Layout shows "Unknown user".

## Fix

Use COALESCE in SQL so we never return empty display_name:
- `authenticateUser`: SELECT `COALESCE(NULLIF(TRIM(display_name), ''), username, 'User') AS display_name`
- `getAuthUserById`: same

This ensures the API always returns a non-empty display_name even when the DB has it empty.

## Key Files

- tt-ts/src/server/auth/index.ts — authenticateUser, getAuthUserById

## Verification

- Both functions use COALESCE for display_name in SELECT
- npm run build passes
