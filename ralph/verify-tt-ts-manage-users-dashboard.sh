#!/usr/bin/env bash
# Verification for tt-ts-manage-users-dashboard-20260223
# Ensures card grid, badges, search, stats are present

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PAGE="$REPO_ROOT/tt-ts/src/client/pages/ManagerPage.tsx"
CSS="$REPO_ROOT/tt-ts/src/client/index.css"

if [ ! -f "$PAGE" ] || [ ! -f "$CSS" ]; then
  echo "FAIL: ManagerPage.tsx or index.css not found"
  exit 1
fi

# mu-grid: user-card class
if ! grep -qE "user-card|userCard" "$PAGE" 2>/dev/null; then
  echo "FAIL: mu-grid — user-card or userCard not found in ManagerPage.tsx"
  exit 1
fi

# mu-badges: badge with role/status
if ! grep -qE "badge|badge-role|badge-status" "$PAGE" "$CSS" 2>/dev/null; then
  echo "FAIL: mu-badges — badge styling not found"
  exit 1
fi

# mu-search: search/filter input
if ! grep -qE "search|filter|display_name|username.*filter" "$PAGE" 2>/dev/null; then
  echo "FAIL: mu-search — search or filter not found in ManagerPage.tsx"
  exit 1
fi

# mu-stats: Total Users, Active Users, or Admin count
if ! grep -qE "Total Users|Active Users|Admin.*count|stat-card" "$PAGE" 2>/dev/null; then
  echo "FAIL: mu-stats — summary stats not found"
  exit 1
fi

# mu-build: build succeeds
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || {
  echo "FAIL: mu-build — tt-ts build failed"
  exit 1
}

echo "OK: Manage Users dashboard verification passed"
exit 0
