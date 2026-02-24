# Updates: tt-logout-and-unknown-user-20260224

## Progress

- 2026-02-24: Logout now navigates to /login; getAuthUserById rejects when display_name OR username empty (||). Ralph task + verify + loop added.
- 2026-02-24: Full plan implemented: sessionConfig for clearCookie options; dual clear (secure+non-secure) on logout; 150ms redirect delay; authenticateUser rejects incomplete users; verify-logout-flow.sh for curl auth test; Ralph artifacts updated. Run with VERIFY_LOGIN_USER/VERIFY_LOGIN_PASSWORD or VERIFY_SKIP_AUTH_FLOW=1.
