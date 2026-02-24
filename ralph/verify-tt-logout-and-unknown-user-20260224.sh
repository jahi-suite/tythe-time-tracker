#!/usr/bin/env bash
# Verification for tt-logout-and-unknown-user-20260224
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. Logout navigates to /login (not /)
if ! grep -q "navigate('/login')" "$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx" 2>/dev/null; then
  echo "FAIL: Layout handleLogout must navigate to /login"
  FAIL=1
fi

# 2. getAuthUserById rejects when display_name OR username empty (|| not &&)
if ! grep -q "!row.display_name?.trim() || !row.username?.trim()" "$REPO_ROOT/tt-ts/src/server/auth/index.ts" 2>/dev/null; then
  echo "FAIL: getAuthUserById must use || to reject when either is empty"
  FAIL=1
fi

if grep -q "!row.display_name?.trim() && !row.username?.trim()" "$REPO_ROOT/tt-ts/src/server/auth/index.ts" 2>/dev/null; then
  echo "FAIL: Use || not && — reject when EITHER is empty"
  FAIL=1
fi

# 3. Build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-logout-and-unknown-user-20260224"
  exit 0
fi
exit 1
