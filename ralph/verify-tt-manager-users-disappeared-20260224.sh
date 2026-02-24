#!/usr/bin/env bash
# Verification for tt-manager-users-disappeared-20260224
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. userListError or similar error state for users fetch
if ! grep -qE "userListError|usersError|userList.*error" "$REPO_ROOT/tt-ts/src/client/pages/ManagerPage.tsx" 2>/dev/null; then
  echo "FAIL: No user list error state found in ManagerPage"
  FAIL=1
fi

# 2. Error message displayed when fetch fails (not silent empty)
if ! grep -qE "Could not load|load users|userListError|usersError" "$REPO_ROOT/tt-ts/src/client/pages/ManagerPage.tsx" 2>/dev/null; then
  echo "FAIL: No error display for failed users fetch"
  FAIL=1
fi

# 3. Build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-manager-users-disappeared-20260224"
  exit 0
fi
exit 1
