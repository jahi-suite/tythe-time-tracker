#!/usr/bin/env bash
# Verify: tt-venue-scoping-ux-20260225
# Venue data scoping, logo, logout flow
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

# --- Users route scopes by venue ---
if grep -qE "venue_id|venueId|session.*venue" tt-ts/src/server/routes/users.ts 2>/dev/null; then
  echo "PASS: users route uses session venue"
  PASS=$((PASS+1))
else
  echo "FAIL: users route missing venue scoping"
  FAIL=$((FAIL+1))
fi

# --- auth getAllUsers or equivalent accepts venueId ---
if grep -qE "venue_id|venueId|getUsersByVenue" tt-ts/src/server/auth/index.ts 2>/dev/null; then
  echo "PASS: auth has venue-scoped user fetch"
  PASS=$((PASS+1))
else
  echo "FAIL: auth missing venue-scoped user fetch"
  FAIL=$((FAIL+1))
fi

# --- Repository/timeTracking scopes by venue ---
if grep -qE "venue_id|venueId" tt-ts/src/server/db/repository.ts 2>/dev/null || grep -qE "venue_id|venueId" tt-ts/src/server/services/timeTracking.ts 2>/dev/null; then
  echo "PASS: time data scoped by venue"
  PASS=$((PASS+1))
else
  echo "FAIL: repository/timeTracking missing venue scoping"
  FAIL=$((FAIL+1))
fi

# --- Logo: tythe-logo only for tythe ---
if grep -qE "tythe.*tythe-logo|venue.*slug.*tythe|tythe-logo.*tythe" tt-ts/src/client/pages/Layout.tsx 2>/dev/null; then
  echo "PASS: Layout logo conditional on venue"
  PASS=$((PASS+1))
else
  echo "FAIL: Layout always shows tythe-logo (should be conditional)"
  FAIL=$((FAIL+1))
fi

# --- Logout redirects to /venues ---
if grep -qE "/venues" tt-ts/src/client/pages/Layout.tsx 2>/dev/null; then
  echo "PASS: Logout redirects to /venues"
  PASS=$((PASS+1))
else
  echo "FAIL: Logout does not redirect to /venues"
  FAIL=$((FAIL+1))
fi

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
