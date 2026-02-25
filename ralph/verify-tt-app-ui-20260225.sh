#!/usr/bin/env bash
# Verify tt-app-ui-20260225: venue login style, no duplicate tabs, pay rates panel
set -e

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

# No duplicate nav: Layout must not have BOTH TopNav with page links AND app-shell__nav
if grep -q 'TopNav' "$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx" && \
   grep -q 'app-shell__nav' "$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx"; then
  if grep -A 8 'TopNav' "$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx" | grep -q 'links={pages'; then
    echo "[FAIL] Layout has TopNav with pages links AND app-shell__nav (duplicate tabs)"
    FAIL=$((FAIL + 1))
  else
    echo "[PASS] Nav deduplicated (TopNav without page links or single nav)"
    PASS=$((PASS + 1))
  fi
else
  echo "[PASS] Nav structure"
  PASS=$((PASS + 1))
fi

# Login page should use dark theme (--night or #0d0b09 in CSS)
if grep -A 8 '\.login-page' "$REPO_ROOT/tt-ts/src/client/index.css" | grep -qE 'var\(--night\)|#0d0b09|background.*night'; then
  echo "[PASS] Login styles use dark theme"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Login styles should use dark theme (--night, #0d0b09)"
  FAIL=$((FAIL + 1))
fi

# Pay rates: /auth/me response must include pay rates for Layout panel
if grep -A 60 'router.get.*\/me' "$REPO_ROOT/tt-ts/src/server/routes/auth.ts" | grep -qE 'standard_rate|enhanced_rate|supervisor_rate'; then
  echo "[PASS] Pay rates in auth/me response"
  PASS=$((PASS + 1))
else
  echo "[FAIL] auth/me should include standard_rate, enhanced_rate, supervisor_rate"
  FAIL=$((FAIL + 1))
fi

# Layout pay-rate-info should not be purely static
if grep -A5 'pay-rate-info' "$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx" | grep -qE 'user\.|useState|useEffect|fetch|standard_rate|enhanced_rate'; then
  echo "[PASS] Pay rates panel uses dynamic data"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Pay rates panel should display user's actual rates (dynamic)"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
