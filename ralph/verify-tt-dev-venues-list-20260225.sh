#!/usr/bin/env bash
# Verify: tt-dev-venues-list-20260225
# Dev-only venues list: API, page, env gate
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PASS=0
FAIL=0

# --- Build must pass ---
cd tt-ts && npm run build 2>/dev/null || { echo "FAIL: tt-ts build failed"; exit 1; }
cd "$REPO_ROOT"
echo "PASS: tt-ts build"
PASS=$((PASS+1))

# --- API route exists (dev routes or /api/dev mount) ---
if [ -f tt-ts/src/server/routes/dev.ts ] || grep -qE "/api/dev|devRoutes|dev\.ts" tt-ts/src/server/index.ts 2>/dev/null; then
  echo "PASS: dev API route registered"
  PASS=$((PASS+1))
else
  echo "FAIL: dev API route missing"
  FAIL=$((FAIL+1))
fi

# --- API checks DEV_VENUES_ENABLED ---
if grep -rqE "DEV_VENUES_ENABLED|dev.*venues.*enabled" tt-ts/src/server/ 2>/dev/null; then
  echo "PASS: API checks DEV_VENUES_ENABLED"
  PASS=$((PASS+1))
else
  echo "FAIL: API does not check DEV_VENUES_ENABLED"
  FAIL=$((FAIL+1))
fi

# --- API returns staff_count and last_used ---
if grep -rqE "staff_count|last_used|staffCount|lastUsed" tt-ts/src/server/ 2>/dev/null; then
  echo "PASS: API returns staff_count and last_used"
  PASS=$((PASS+1))
else
  echo "FAIL: API missing staff_count or last_used"
  FAIL=$((FAIL+1))
fi

# --- DevVenuesPage exists ---
if [ -f tt-ts/src/client/pages/DevVenuesPage.tsx ]; then
  echo "PASS: DevVenuesPage exists"
  PASS=$((PASS+1))
else
  echo "FAIL: DevVenuesPage missing"
  FAIL=$((FAIL+1))
fi

# --- Route /dev/venues in App ---
if grep -qE "dev/venues|DevVenuesPage" tt-ts/src/client/App.tsx 2>/dev/null; then
  echo "PASS: /dev/venues route in App"
  PASS=$((PASS+1))
else
  echo "FAIL: /dev/venues route missing"
  FAIL=$((FAIL+1))
fi

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
