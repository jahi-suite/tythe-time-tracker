# Updates: tt-first-admin-ui-20260223

## 2026-02-23

- Task created. Goal: first admin account via UI form, no secrets editing.
- Implemented: When users table empty, login page shows "Set up your admin account" form (username, display name, password, confirm). create_first_manager_from_ui() in database/init.py. Secrets-based flow kept in expander for advanced users.
