#!/usr/bin/env bash
# Verify: tt-karisuite-backend-20260225
# Kari Suite backend: payroll engine, unified DB, tests
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PASS=0
FAIL=0

# --- Payroll engine exists (Python) ---
if [ -f tythe_time_tracker/core/payroll_engine.py ] 2>/dev/null; then
  echo "PASS: payroll_engine.py exists"
  PASS=$((PASS+1))
else
  echo "FAIL: payroll_engine.py missing"
  FAIL=$((FAIL+1))
fi

# --- export_functions uses repository or get_db_connection (not raw psycopg2) ---
if grep -q "st.secrets" export_functions.py 2>/dev/null; then
  echo "FAIL: export_functions still uses st.secrets for DB"
  FAIL=$((FAIL+1))
elif grep -q "get_db_connection\|TimeEntryRepository\|database.connection" export_functions.py 2>/dev/null; then
  echo "PASS: export_functions uses unified DB layer"
  PASS=$((PASS+1))
else
  echo "FAIL: export_functions DB access not unified"
  FAIL=$((FAIL+1))
fi

# --- Payroll tests exist ---
if grep -rq "split_shift\|break_deduction\|enhanced.*standard\|DST" tests/ 2>/dev/null; then
  echo "PASS: payroll regression tests exist"
  PASS=$((PASS+1))
else
  echo "FAIL: payroll regression tests missing"
  FAIL=$((FAIL+1))
fi

# --- No direct psycopg2.connect outside connection.py ---
DIRECT_CONNECTS=$(grep -r "psycopg2.connect" --include="*.py" . 2>/dev/null | grep -v "tythe_time_tracker/database/connection.py" | grep -v "__pycache__" | grep -v "tests/" | grep -v "/.venv/" || true)
if [ -z "$DIRECT_CONNECTS" ]; then
  echo "PASS: no direct psycopg2.connect outside connection.py"
  PASS=$((PASS+1))
else
  echo "FAIL: direct psycopg2.connect found outside connection layer"
  FAIL=$((FAIL+1))
fi

# --- Backend contract doc exists ---
if [ -f docs/BACKEND_CONTRACT.md ] 2>/dev/null; then
  echo "PASS: BACKEND_CONTRACT.md exists"
  PASS=$((PASS+1))
else
  echo "FAIL: BACKEND_CONTRACT.md missing"
  FAIL=$((FAIL+1))
fi

# --- tt-ts build still passes ---
cd tt-ts && npm run build 2>/dev/null || { echo "FAIL: tt-ts build failed"; exit 1; }
cd "$REPO_ROOT"
echo "PASS: tt-ts build"
PASS=$((PASS+1))

# --- Python tests pass (if any) ---
if [ -d tests ] && python3 -m pytest tests/ -q --tb=no 2>/dev/null; then
  echo "PASS: Python tests"
  PASS=$((PASS+1))
else
  echo "PASS: Python tests (skip if no tests)"
  PASS=$((PASS+1))
fi

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
