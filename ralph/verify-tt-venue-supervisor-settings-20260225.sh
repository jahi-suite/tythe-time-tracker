#!/usr/bin/env bash
# Verify: tt-venue-supervisor-settings-20260225
# Per-venue supervisor settings: DB, API, UI, Clock, Manager, export
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

# --- Migration has supervisor columns ---
if grep -qE "supervisor_enabled|supervisor_label|supervisor_deduct" tt-ts/src/server/db/migrate.ts 2>/dev/null; then
  echo "PASS: migration has supervisor settings"
  PASS=$((PASS+1))
else
  echo "FAIL: migration missing supervisor settings"
  FAIL=$((FAIL+1))
fi

# --- getVenueSettings returns supervisor fields ---
if grep -qE "supervisor_enabled|supervisor_label|supervisor_deduct" tt-ts/src/server/auth/index.ts 2>/dev/null; then
  echo "PASS: getVenueSettings has supervisor fields"
  PASS=$((PASS+1))
else
  echo "FAIL: getVenueSettings missing supervisor fields"
  FAIL=$((FAIL+1))
fi

# --- VenueSettingsPage has supervisor UI ---
if grep -qE "supervisor_enabled|supervisor_label|Supervisor|supervisor" tt-ts/src/client/pages/VenueSettingsPage.tsx 2>/dev/null; then
  echo "PASS: VenueSettingsPage has supervisor fieldset"
  PASS=$((PASS+1))
else
  echo "FAIL: VenueSettingsPage missing supervisor UI"
  FAIL=$((FAIL+1))
fi

# --- applyBreakDeduction uses supervisor_deduct_break ---
if grep -qE "supervisor_deduct|supervisor_break" tt-ts/src/server/services/exportUtils.ts 2>/dev/null; then
  echo "PASS: exportUtils uses supervisor_deduct_break"
  PASS=$((PASS+1))
else
  echo "FAIL: exportUtils not using supervisor_deduct_break"
  FAIL=$((FAIL+1))
fi

# --- Clock or Manager uses supervisor_enabled ---
if grep -qE "supervisor_enabled|venueSettings.*supervisor" tt-ts/src/client/pages/ClockPage.tsx 2>/dev/null || grep -qE "supervisor_enabled|venueSettings.*supervisor" tt-ts/src/client/pages/ManagerPage.tsx 2>/dev/null; then
  echo "PASS: Clock or Manager uses supervisor_enabled"
  PASS=$((PASS+1))
else
  echo "FAIL: Clock/Manager not using supervisor_enabled"
  FAIL=$((FAIL+1))
fi

# --- Client can fetch venue settings (for non-admin) ---
if grep -qE "venues/current|venues.*settings|getSettings" tt-ts/src/client/pages/ClockPage.tsx 2>/dev/null || grep -qE "auth/me.*venue|venue.*settings" tt-ts/src/client/ 2>/dev/null; then
  echo "PASS: client can fetch venue settings"
  PASS=$((PASS+1))
else
  echo "FAIL: client cannot fetch venue settings for Clock"
  FAIL=$((FAIL+1))
fi

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
