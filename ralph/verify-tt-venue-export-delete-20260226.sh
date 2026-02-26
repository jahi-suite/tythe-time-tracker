#!/usr/bin/env bash
# Verify tt-venue-export-delete-20260226: export and delete account in venue settings
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT/tt-ts"

PASS=0
FAIL=0

check() {
  if "$@"; then
    echo "[PASS] $*"
    PASS=$((PASS + 1))
    return 0
  else
    echo "[FAIL] $*"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

# Build must pass
check npm run build >/dev/null 2>&1

# Export endpoint exists (route or handler)
check grep -rq 'export-account-data\|exportAccountData\|export.*account' "$REPO_ROOT/tt-ts/src/server" 2>/dev/null

# Delete account endpoint exists
check grep -rq 'delete-account\|deleteAccount\|delete.*account' "$REPO_ROOT/tt-ts/src/server" 2>/dev/null

# VenueSettingsPage has export and delete UI
check grep -qi 'export' "$REPO_ROOT/tt-ts/src/client/pages/VenueSettingsPage.tsx" 2>/dev/null
check grep -qi 'delete' "$REPO_ROOT/tt-ts/src/client/pages/VenueSettingsPage.tsx" 2>/dev/null

# Client API has export and delete methods
check grep -rq 'exportAccountData\|export.*account\|deleteAccount\|delete.*account' "$REPO_ROOT/tt-ts/src/client/api.ts" 2>/dev/null

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
