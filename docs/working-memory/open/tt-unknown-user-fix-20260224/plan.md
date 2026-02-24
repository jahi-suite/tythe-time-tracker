# Task: tt-unknown-user-fix-20260224

## Goal

Fix "Logged in as: Unknown user ()" when admin logs in.

## Steps

1. Harden SQL COALESCE in authenticateUser and getAuthUserById
2. Harden username in getAuthUserById
3. Layout defensive fallback (never show "Unknown user")
4. Migration to fix display_name (only; do not change username)
5. Verify script + build
6. Trigger deploy (real file change)

## Key Files

- tt-ts/src/server/auth/index.ts
- tt-ts/src/client/pages/Layout.tsx
- tt-ts/src/server/db/migrate.ts
