# Spec: Authentication

## Overview

Custom username/password authentication. No OAuth. Roles determine access level.

---

## Roles

| Role | Access |
|---|---|
| `employee` | Clock in/out, personal timesheet, export own timesheet |
| `manager` | All employee access + manager dashboard (view all, add/edit/delete shifts, manage users) |
| `admin` | All manager access + promote users to admin, delete accounts |

---

## Login flow

1. User submits username + password
2. Server looks up user by username in `users` table
3. Verify bcrypt hash: `bcrypt.verify(password, password_hash)`
4. If match and `active = true`: create session; return user `{ id, username, role, display_name }`
5. If inactive: return 401 "Account disabled"
6. If no match: return 401 "Invalid credentials"

---

## First-user bootstrap

- If `users` table is empty, show "Set up your admin account" form (username, display name, password)
- Creates first user with `role = 'admin'`
- Optional: bootstrap from env vars `SEED_MANAGER_USERNAME` / `SEED_MANAGER_PASSWORD`

---

## Session

- **TypeScript app:** JWT or session cookie (implementation detail); store `{ id, username, role, display_name }`
- Session expires on logout or token expiry

---

## Password rules

- Minimum 8 characters (recommended, not enforced at DB level)
- Stored as bcrypt hash (cost factor 12 recommended)

---

## Acceptance criteria

- [ ] Login with valid credentials returns session with correct user data
- [ ] Login with wrong password returns 401
- [ ] Login with inactive user returns 401
- [ ] First user can self-register when no users exist
- [ ] Logout destroys session
- [ ] Protected routes reject unauthenticated requests with 401
- [ ] Manager routes reject `employee` role with 403
