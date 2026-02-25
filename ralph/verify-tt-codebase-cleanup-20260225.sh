#!/usr/bin/env bash
# Verify: tt-codebase-cleanup-20260225
# Codebase cleanup — no broken state, reasonable task/doc structure
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PASS=0
FAIL=0

check() {
  if "$@"; then
    PASS=$((PASS + 1))
    return 0
  else
    FAIL=$((FAIL + 1))
    return 1
  fi
}

# 1. set-cloudrun-env-from-dotenv.sh exists (used for Cloud Run env)
if [ -f "ralph/set-cloudrun-env-from-dotenv.sh" ]; then
  echo "PASS: ralph/set-cloudrun-env-from-dotenv.sh exists"
  PASS=$((PASS + 1))
else
  echo "FAIL: ralph/set-cloudrun-env-from-dotenv.sh missing"
  FAIL=$((FAIL + 1))
fi

# 2. Root Dockerfile exists (builds tt-ts)
if [ -f "Dockerfile" ]; then
  echo "PASS: Root Dockerfile exists"
  PASS=$((PASS + 1))
else
  echo "FAIL: Root Dockerfile missing"
  FAIL=$((FAIL + 1))
fi

# 3. ralph/Untitled removed
if [ ! -f "ralph/Untitled" ] && [ ! -d "ralph/Untitled" ]; then
  echo "PASS: ralph/Untitled removed"
  PASS=$((PASS + 1))
else
  echo "FAIL: ralph/Untitled still exists"
  FAIL=$((FAIL + 1))
fi

# 4. Open tasks count is reasonable (after archiving, expect fewer than 46)
OPEN_COUNT=$(ls -d docs/working-memory/open/*/ 2>/dev/null | wc -l)
if [ "$OPEN_COUNT" -lt 50 ]; then
  echo "PASS: Open tasks count $OPEN_COUNT (reasonable)"
  PASS=$((PASS + 1))
else
  echo "FAIL: Too many open tasks ($OPEN_COUNT)"
  FAIL=$((FAIL + 1))
fi

# 5. Cleanup task exists in open
if [ -f "docs/working-memory/open/tt-codebase-cleanup-20260225/plan.md" ]; then
  echo "PASS: Cleanup task plan exists"
  PASS=$((PASS + 1))
else
  echo "FAIL: Cleanup task plan missing"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
