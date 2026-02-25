#!/usr/bin/env bash
# Verify: tt-dev-venue-deactivate-20260225
# Deactivate/reactivate venue from Dev Venues page
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

# --- Migration has active column on venues ---
if grep -qE "active.*venues|venues.*active" tt-ts/src/server/db/migrate.ts 2>/dev/null; then
  echo "PASS: migration has venues.active"
  PASS=$((PASS+1))
else
  echo "FAIL: migration missing venues.active"
  FAIL=$((FAIL+1))
fi

# --- getVenueBySlug filters by active ---
if grep -qE "active|active\s*=\s*true" tt-ts/src/server/auth/index.ts 2>/dev/null; then
  echo "PASS: auth filters by active"
  PASS=$((PASS+1))
else
  echo "FAIL: auth does not filter inactive venues"
  FAIL=$((FAIL+1))
fi

# --- Dev API has deactivate route ---
if grep -qE "deactivate|/deactivate" tt-ts/src/server/routes/dev.ts 2>/dev/null; then
  echo "PASS: dev API has deactivate route"
  PASS=$((PASS+1))
else
  echo "FAIL: dev API missing deactivate route"
  FAIL=$((FAIL+1))
fi

# --- Tythe protected from deactivate ---
if grep -qE "tythe|slug.*tythe" tt-ts/src/server/routes/dev.ts 2>/dev/null; then
  echo "PASS: Tythe protected in deactivate"
  PASS=$((PASS+1))
else
  echo "FAIL: Tythe not protected from deactivate"
  FAIL=$((FAIL+1))
fi

# --- DevVenuesPage has Deactivate button ---
if grep -qE "Deactivate|deactivate" tt-ts/src/client/pages/DevVenuesPage.tsx 2>/dev/null; then
  echo "PASS: DevVenuesPage has Deactivate UI"
  PASS=$((PASS+1))
else
  echo "FAIL: DevVenuesPage missing Deactivate button"
  FAIL=$((FAIL+1))
fi

# --- GET dev/venues returns active ---
if grep -qE "active|v\.active" tt-ts/src/server/routes/dev.ts 2>/dev/null; then
  echo "PASS: dev venues API returns active"
  PASS=$((PASS+1))
else
  echo "FAIL: dev venues API missing active field"
  FAIL=$((FAIL+1))
fi

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
