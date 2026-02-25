#!/usr/bin/env bash
# Verify: tt-multi-venue-20260225
# Multi-venue: venues table, venue API, auth scoping, client routes
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

# --- DB constants: venues table and venue_id ---
if grep -qE "VENUES_TABLE|VENUE_ID" tt-ts/src/shared/constants.ts 2>/dev/null; then
  echo "PASS: DB.VENUES_TABLE or VENUE_ID in constants"
  PASS=$((PASS+1))
else
  echo "FAIL: constants.ts missing VENUES_TABLE or VENUE_ID"
  FAIL=$((FAIL+1))
fi

# --- Migration creates venues ---
if grep -qE "venues|venue_id" tt-ts/src/server/db/migrate.ts 2>/dev/null; then
  echo "PASS: migrate.ts has venues/venue_id"
  PASS=$((PASS+1))
else
  echo "FAIL: migrate.ts missing venues/venue_id"
  FAIL=$((FAIL+1))
fi

# --- Venue API routes ---
if grep -qE "/api/venues|venues/search|venues.*post" tt-ts/src/server/index.ts 2>/dev/null; then
  echo "PASS: venue API routes in server"
  PASS=$((PASS+1))
else
  echo "FAIL: server missing /api/venues routes"
  FAIL=$((FAIL+1))
fi

# --- Auth login requires venue ---
if grep -qE "venue_slug|venue_id" tt-ts/src/server/routes/auth.ts 2>/dev/null; then
  echo "PASS: auth routes use venue_slug or venue_id"
  PASS=$((PASS+1))
else
  echo "FAIL: auth routes missing venue scoping"
  FAIL=$((FAIL+1))
fi

# --- Client has venue-scoped routes ---
if grep -qE "venueSlug|:venueSlug|VenueApp|VenueLanding" tt-ts/src/client/App.tsx 2>/dev/null; then
  echo "PASS: App.tsx has venue-scoped routing"
  PASS=$((PASS+1))
else
  echo "FAIL: App.tsx missing venue routes (venueSlug, VenueApp)"
  FAIL=$((FAIL+1))
fi

# --- Venue landing or search UI ---
if grep -rqE "venues/search|VenueLanding|venue.*search|create.*venue" tt-ts/src/client/ 2>/dev/null; then
  echo "PASS: client has venue search or create UI"
  PASS=$((PASS+1))
else
  echo "FAIL: client missing venue search/create UI"
  FAIL=$((FAIL+1))
fi

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
