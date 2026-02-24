# Task: tt-logout-and-unknown-user-20260224

## Goal

1. **Logout** — After logout, navigate to /login instead of / (marketing page).
2. **Unknown user** — Ensure incomplete users are rejected. If still occurring, tighten the check (e.g. reject when display_name is empty even if username exists, or vice versa).

## Key Files

- tt-ts/src/client/pages/Layout.tsx — handleLogout, navigate('/') → navigate('/login')
- tt-ts/src/server/auth/index.ts — getAuthUserById incomplete-user check

## Implementation

### 1. Logout → /login

In Layout.tsx handleLogout: change `navigate('/')` to `navigate('/login')`.

### 2. Stricter incomplete-user check

In getAuthUserById: reject if display_name is empty OR username is empty (require both to be non-empty):
- `if (!row.display_name?.trim() || !row.username?.trim()) return null`

This ensures we never return a user missing either identifier.

## Verification

- Layout.tsx has navigate('/login') in handleLogout
- getAuthUserById returns null when display_name or username is empty
- npm run build passes
