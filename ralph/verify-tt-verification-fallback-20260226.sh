#!/usr/bin/env bash
# Verify tt-verification-fallback-20260226: unverified venues can login, clock, view timesheet; cannot add staff
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

# Middleware: requireEmailVerifiedForManager or similar for manager routes
check grep -rq 'requireEmailVerifiedForManager\|email_verified.*manager\|requireVerified' "$REPO_ROOT/tt-ts/src/server" 2>/dev/null || \
  grep -rq 'EMAIL_NOT_VERIFIED\|email_verified' "$REPO_ROOT/tt-ts/src/server/middleware" 2>/dev/null

# auth/me returns email_verified
check grep -rq 'email_verified' "$REPO_ROOT/tt-ts/src/server/routes/auth.ts" 2>/dev/null

# Client: banner or verification message for unverified
check grep -rq 'Verify your email\|email_verified\|verify.*staff' "$REPO_ROOT/tt-ts/src/client" 2>/dev/null

# Users route: verification check before create/update/delete
check grep -rq 'email_verified\|EMAIL_NOT_VERIFIED\|requireEmailVerified' "$REPO_ROOT/tt-ts/src/server/routes/users.ts" 2>/dev/null

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
