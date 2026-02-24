#!/usr/bin/env bash
# Verification for tt-unknown-user-fix-20260224
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. Auth uses COALESCE for display_name in both authenticateUser and getAuthUserById
COUNT=$(grep -c "COALESCE.*NULLIF.*display_name" "$REPO_ROOT/tt-ts/src/server/auth/index.ts" 2>/dev/null || echo 0)
if [ "${COUNT:-0}" -lt 2 ]; then
  echo "FAIL: authenticateUser and getAuthUserById must both use COALESCE(NULLIF(TRIM(display_name), ''), ...) for display_name"
  FAIL=1
fi

# 2. Layout has defensive fallback — no bare 'Unknown user' as final fallback; use 'User'
if grep -q "Unknown user" "$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx" 2>/dev/null; then
  echo "FAIL: Layout must not show 'Unknown user'; use 'User' as final fallback"
  FAIL=1
fi

# 3. Layout has trim/fallback chain
if ! grep -q "\.trim()" "$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx" 2>/dev/null; then
  echo "FAIL: Layout must use trim() in displayName fallback chain"
  FAIL=1
fi

# 4. Build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-unknown-user-fix-20260224"
  exit 0
fi
exit 1
