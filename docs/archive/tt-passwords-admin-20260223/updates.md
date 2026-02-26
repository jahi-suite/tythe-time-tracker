## 2026-02-23

- Task created. Goal: self-service password change, manager reset for employees, admin role, promote-to-admin with bootstrap.
- `passwords-01` implemented and verified: users.role CHECK supports `admin` (including legacy constraint migration), auth password change/reset/promote APIs added with manager/admin rules, and manager dashboard access now allows admins.
- `passwords-02` implemented and verified (UI): added sidebar "Change my password" form for all logged-in users, manager/admin "Reset Password" actions in Manage Users with role-based visibility, and "Promote to admin" UI honoring first-admin bootstrap + admin-only promotion after bootstrap. Manage Users role forms now safely handle existing `admin` users.
