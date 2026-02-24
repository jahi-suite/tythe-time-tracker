#!/usr/bin/env bash
# Verification for tt-logout-and-unknown-user-20260224
# Runs static checks, verify-logout-flow (server + curl auth flow), and build.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. Layout: redirect to /login (window.location or navigate) with delay
if ! grep -qE "window\.location\.(href|assign).*login|navigate\(['\"]/login['\"]\)" "$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx" 2>/dev/null; then
  echo "FAIL: Layout handleLogout must redirect to /login"
  FAIL=1
fi

if ! grep -q "setTimeout.*150" "$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx" 2>/dev/null; then
  echo "FAIL: Layout handleLogout must have 150ms delay before redirect"
  FAIL=1
fi

# 2. getAuthUserById: reject when display_name OR username empty
if ! grep -q "!row.display_name?.trim() || !row.username?.trim()" "$REPO_ROOT/tt-ts/src/server/auth/index.ts" 2>/dev/null; then
  echo "FAIL: getAuthUserById must use || to reject when either is empty"
  FAIL=1
fi

# 3. authenticateUser: reject incomplete users
if ! grep -q "display_name?.trim() || !row.username?.trim()" "$REPO_ROOT/tt-ts/src/server/auth/index.ts" 2>/dev/null; then
  echo "FAIL: authenticateUser must reject when display_name or username empty"
  FAIL=1
fi

# 4. sessionConfig and clearCookie
if ! grep -q "getSessionCookieOptions" "$REPO_ROOT/tt-ts/src/server/routes/auth.ts" 2>/dev/null; then
  echo "FAIL: auth logout must use getSessionCookieOptions"
  FAIL=1
fi

# 5. verify-logout-flow (server + curl auth flow) — skip if VERIFY_SKIP_AUTH_FLOW=1 (no DB)
if [ "${VERIFY_SKIP_AUTH_FLOW:-0}" != "1" ]; then
  if [ -x "$REPO_ROOT/tt-ts/scripts/verify-logout-flow.sh" ]; then
    if ! (cd "$REPO_ROOT/tt-ts" && VERIFY_LOGIN_USER="${VERIFY_LOGIN_USER:-}" VERIFY_LOGIN_PASSWORD="${VERIFY_LOGIN_PASSWORD:-}" ./scripts/verify-logout-flow.sh 2>/dev/null); then
      echo "FAIL: verify-logout-flow failed. Set VERIFY_LOGIN_USER and VERIFY_LOGIN_PASSWORD if DB has existing users, or VERIFY_SKIP_AUTH_FLOW=1 to skip."
      FAIL=1
    fi
  else
    echo "FAIL: tt-ts/scripts/verify-logout-flow.sh not found or not executable"
    FAIL=1
  fi
fi

# 6. Build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-logout-and-unknown-user-20260224"
  exit 0
fi
exit 1
