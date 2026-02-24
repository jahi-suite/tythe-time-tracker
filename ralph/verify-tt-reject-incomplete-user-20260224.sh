#!/usr/bin/env bash
# Verification for tt-reject-incomplete-user-20260224
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. getAuthUserById has the incomplete-user check (display_name and username both empty)
if ! grep -q "display_name.*username\|username.*display_name" "$REPO_ROOT/tt-ts/src/server/auth/index.ts" 2>/dev/null; then
  echo "FAIL: getAuthUserById missing check for empty display_name and username"
  FAIL=1
fi

if ! grep -q "return null" "$REPO_ROOT/tt-ts/src/server/auth/index.ts" 2>/dev/null; then
  echo "FAIL: getAuthUserById must return null for incomplete users"
  FAIL=1
fi

# 2. Build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-reject-incomplete-user-20260224"
  exit 0
fi
exit 1
