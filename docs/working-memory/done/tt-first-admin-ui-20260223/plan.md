# Task: tt-first-admin-ui-20260223

> Created: 2026-02-23 | Status: in progress
> Stories: [user_story.json](./user_story.json)

## What and why

- **Problem:** Creating the first manager account requires editing Streamlit secrets (SEED_MANAGER_USERNAME, SEED_MANAGER_PASSWORD). Target users (venue managers) are not tech-savvy.
- **Goal:** First-time setup via the UI only. When the users table is empty, show a simple form: "Create your admin account" with username, display name, password. No secrets editing required.
- **Keep:** Secrets-based flow as optional fallback for deployers who prefer it.

## Context

- Login page: `tythe_time_tracker/ui/pages/login.py` — expander "First time? Create the first manager account"
- Bootstrap: `tythe_time_tracker/database/init.py` — `bootstrap_seed_manager()` reads from secrets
- Auth: `tythe_time_tracker/core/auth.py` — `create_user()` creates users
- Need: `create_first_manager_ui(username, password, display_name)` — creates first manager when table empty, no secrets

## Steps

1. Add `create_first_manager_from_ui(username, password, display_name)` in database/init.py or auth: when users table is empty, insert the manager. Returns (ok, message).
2. On login page: when users table is empty, show prominent "Set up your admin account" form (username, display name, password, confirm password). On submit, call create_first_manager_from_ui, then rerun so they can log in.
3. Keep the secrets-based expander as secondary ("Advanced: use Streamlit secrets") or remove it for simplicity.
4. Update README: first-time setup is "fill in the form on the login page" — no secrets needed.
