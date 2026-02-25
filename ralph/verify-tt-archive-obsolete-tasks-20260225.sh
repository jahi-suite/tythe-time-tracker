#!/usr/bin/env bash
# Verify: tt-archive-obsolete-tasks-20260225
# Obsolete Netlify/legacy tasks archived to done/
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PASS=0
FAIL=0

# --- Netlify tasks must be in done/ (not open) ---
for t in tt-netlify-fullstack-20260224 tt-netlify-502-debug-20260224 tt-netlify-login-debug-20260224; do
  if [ -d "docs/working-memory/done/$t" ]; then
    echo "PASS: $t archived to done/"
    PASS=$((PASS+1))
  else
    echo "FAIL: $t still in open/ (should be in done/)"
    FAIL=$((FAIL+1))
  fi
done

# --- tt-login-auth-diagnosis archived (Netlify-focused; app works) ---
if [ -d "docs/working-memory/done/tt-login-auth-diagnosis-20260224" ]; then
  echo "PASS: tt-login-auth-diagnosis-20260224 archived"
  PASS=$((PASS+1))
else
  echo "FAIL: tt-login-auth-diagnosis-20260224 still in open/"
  FAIL=$((FAIL+1))
fi

# --- Open count reduced (target: fewer open tasks) ---
OPEN_COUNT=$(ls -d docs/working-memory/open/*/ 2>/dev/null | wc -l)
[ "$OPEN_COUNT" -le 15 ] && { echo "PASS: Open tasks $OPEN_COUNT (<= 15)"; PASS=$((PASS+1)); } || { echo "FAIL: $OPEN_COUNT open tasks (target <= 15)"; FAIL=$((FAIL+1)); }

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
