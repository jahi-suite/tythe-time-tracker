#!/usr/bin/env bash
# Verify tt-email-verification-20260226: email verification flow, founder exemption
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

# Migration: venues has new columns (migrate.ts or repository)
if grep -q 'email_verified\|verification_token_hash\|is_founder' "$REPO_ROOT/tt-ts/src/server" 2>/dev/null; then
  echo "[PASS] Migration columns present"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Migration: add email_verified, verification_token_hash, is_founder, etc."
  FAIL=$((FAIL + 1))
fi

# Founder rule: tythebarn exempt
check grep -q 'tythebarn' "$REPO_ROOT/tt-ts/src/server" 2>/dev/null
check grep -q 'founding test partner\|founder' "$REPO_ROOT/tt-ts/src/server" 2>/dev/null

# EmailService exists
if [ -f "$REPO_ROOT/tt-ts/src/server/services/emailService.ts" ] || [ -f "$REPO_ROOT/tt-ts/src/server/services/email.ts" ]; then
  echo "[PASS] EmailService exists"
  PASS=$((PASS + 1))
else
  echo "[FAIL] Create EmailService (emailService.ts or email.ts)"
  FAIL=$((FAIL + 1))
fi

# Verification route exists
check grep -q 'verify-email\|verifyEmail' "$REPO_ROOT/tt-ts/src/server" 2>/dev/null

# Access gate / middleware
check grep -q 'email_verified\|verify-email-pending' "$REPO_ROOT/tt-ts/src/server" 2>/dev/null
check grep -q 'verify-email-pending\|VerifyPending' "$REPO_ROOT/tt-ts/src/client" 2>/dev/null

# Docs
check [ -f "$REPO_ROOT/docs/google-email-setup.md" ] 2>/dev/null

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
