#!/usr/bin/env bash
# Verification for tt-logged-in-as-empty-20260224
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. getAuthUserById exists in auth
if ! grep -q "getAuthUserById" "$REPO_ROOT/tt-ts/src/server/auth/index.ts" 2>/dev/null; then
  echo "FAIL: getAuthUserById not found in auth/index.ts"
  FAIL=1
fi

# 2. GET /me uses it (re-fetches from DB)
if ! grep -q "getAuthUserById\|session.user.id" "$REPO_ROOT/tt-ts/src/server/routes/auth.ts" 2>/dev/null; then
  echo "FAIL: /me route does not re-fetch user from DB"
  FAIL=1
fi

# 3. Layout has display fallback
if ! grep -qE "display_name.*username|username.*display_name|Unknown user" "$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx" 2>/dev/null; then
  echo "FAIL: Layout missing display fallback for empty user"
  FAIL=1
fi

# 4. Build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-logged-in-as-empty-20260224"
  exit 0
fi
exit 1
