#!/usr/bin/env bash
# Verification for tt-netlify-login-debug-20260224
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. /api/debug route exists
if ! grep -q '"/api/debug"' "$REPO_ROOT/tt-ts/src/server/index.ts" 2>/dev/null; then
  echo "FAIL: /api/debug route not found in tt-ts/src/server/index.ts"
  FAIL=1
fi

# 2. Debug returns env, session, request
if ! grep -q 'hasSupabaseHost\|hasSessionSecret\|nodeEnv\|supabasePort' "$REPO_ROOT/tt-ts/src/server/index.ts" 2>/dev/null; then
  echo "FAIL: /api/debug missing env fields"
  FAIL=1
fi

# 3. Login logging present
if ! grep -q '\[login\]' "$REPO_ROOT/tt-ts/src/server/routes/auth.ts" 2>/dev/null; then
  echo "FAIL: [login] logging not found in auth.ts"
  FAIL=1
fi

# 4. Build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-netlify-login-debug-20260224"
  exit 0
fi
exit 1
