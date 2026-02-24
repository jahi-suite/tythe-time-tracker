#!/usr/bin/env bash
# Verification for tt-admin-unknown-user-20260224
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. Both authenticateUser and getAuthUserById use COALESCE for display_name (need 2 occurrences)
COUNT=$(grep -c "COALESCE.*display_name" "$REPO_ROOT/tt-ts/src/server/auth/index.ts" 2>/dev/null || echo 0)
if [ "${COUNT:-0}" -lt 2 ]; then
  echo "FAIL: authenticateUser and getAuthUserById must both use COALESCE for display_name"
  FAIL=1
fi

# 3. Build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-admin-unknown-user-20260224"
  exit 0
fi
exit 1
