#!/usr/bin/env bash
# Verification for tt-netlify-502-debug-20260224
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. Dynamic import present (not static import of createApp)
if grep -q "import { createApp }" "$REPO_ROOT/tt-ts/netlify/functions/server.ts" 2>/dev/null; then
  echo "FAIL: static import of createApp still present — use dynamic import"
  FAIL=1
fi

if ! grep -q "await import.*server/index" "$REPO_ROOT/tt-ts/netlify/functions/server.ts" 2>/dev/null; then
  echo "FAIL: dynamic import of server not found"
  FAIL=1
fi

# 2. Catch block returns diagnostic
if ! grep -q "startup_failed\|jsonResponse" "$REPO_ROOT/tt-ts/netlify/functions/server.ts" 2>/dev/null; then
  echo "FAIL: diagnostic catch block missing"
  FAIL=1
fi

# 3. Build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-netlify-502-debug-20260224"
  exit 0
fi
exit 1
