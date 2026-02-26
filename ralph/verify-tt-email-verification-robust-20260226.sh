#!/usr/bin/env bash
# Verify tt-email-verification-robust-20260226: auto-login, resend from dashboard, diagnostics
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

# VenueLandingPage: after create, login then redirect (not verify-email-pending)
check grep -rq 'auth\.login\|login.*redirect\|redirect.*clock\|redirect.*dashboard' "$REPO_ROOT/tt-ts/src/client/pages/VenueLandingPage.tsx" 2>/dev/null

# Resend from dashboard / banner
check grep -rq 'resend.*verification\|Resend verification\|resend-verification' "$REPO_ROOT/tt-ts/src/client" 2>/dev/null

# Resend endpoint: session venue_id or body venueId
check grep -rq 'session.*venue_id\|venue_id.*session\|req\.session' "$REPO_ROOT/tt-ts/src/server/routes/venues.ts" 2>/dev/null

# Rate limit 429 or retryAfterMinutes
check grep -rq '429\|retryAfterMinutes\|rate.*limit' "$REPO_ROOT/tt-ts/src/server" 2>/dev/null

# Troubleshooting doc
check [ -f "$REPO_ROOT/docs/email-verification-troubleshooting.md" ] 2>/dev/null

# VerifyPendingPage: login link
check grep -rq 'Log in\|login\|Already have' "$REPO_ROOT/tt-ts/src/client/pages/VerifyPendingPage.tsx" 2>/dev/null

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
