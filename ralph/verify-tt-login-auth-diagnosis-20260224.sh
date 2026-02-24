#!/usr/bin/env bash
# Verification for tt-login-auth-diagnosis-20260224
# USER runs this script — agent does NOT run it.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. No "Unknown user" in client pages
UNKNOWN_COUNT=$(grep -r "Unknown user" "$REPO_ROOT/tt-ts/src/client" 2>/dev/null | wc -l || echo 0)
if [ "${UNKNOWN_COUNT:-0}" -gt 0 ]; then
  echo "FAIL: Remove all 'Unknown user' fallbacks from client (use 'User')"
  grep -rn "Unknown user" "$REPO_ROOT/tt-ts/src/client" 2>/dev/null || true
  FAIL=1
fi

# 2. gcp-env.template mentions SESSION_STORE
if ! grep -q "SESSION_STORE" "$REPO_ROOT/tt-ts/gcp-env.template" 2>/dev/null; then
  echo "FAIL: gcp-env.template should include SESSION_STORE=pg"
  FAIL=1
fi

# 3. Login uses session.save before res.json (or equivalent)
if ! grep -q "session\.save\|req\.session\.save" "$REPO_ROOT/tt-ts/src/server/routes/auth.ts" 2>/dev/null; then
  echo "WARN: Login may not await session save — check auth.ts for req.session.save before res.json"
  # Don't fail — Phase 2 might not be done yet
fi

# 4. Build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-login-auth-diagnosis-20260224"
  exit 0
fi
exit 1
