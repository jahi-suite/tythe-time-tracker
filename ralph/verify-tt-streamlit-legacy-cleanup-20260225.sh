#!/usr/bin/env bash
# Verify: tt-streamlit-legacy-cleanup-20260225
# Streamlit legacy cleanup: secrets, core, DB, dead code
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PASS=0
FAIL=0

# --- Python syntax valid for core and database ---
if python3 -m py_compile tythe_time_tracker/core/models.py tythe_time_tracker/database/connection.py 2>/dev/null; then
  echo "PASS: core and database compile"
  PASS=$((PASS+1))
else
  echo "FAIL: core or database has syntax errors"
  FAIL=$((FAIL+1))
fi

# --- No streamlit in core/services.py ---
if ! grep -q "import streamlit\|st\." tythe_time_tracker/core/services.py 2>/dev/null; then
  echo "PASS: core/services.py has no Streamlit"
  PASS=$((PASS+1))
else
  echo "FAIL: core/services.py still imports Streamlit"
  FAIL=$((FAIL+1))
fi

# --- export_functions uses get_db_connection or repository, not st.secrets for DB ---
if grep -q "st.secrets" export_functions.py 2>/dev/null; then
  echo "FAIL: export_functions still uses st.secrets for DB"
  FAIL=$((FAIL+1))
elif grep -q "get_db_connection\|TimeEntryRepository\|database.connection" export_functions.py 2>/dev/null; then
  echo "PASS: export_functions uses repository/connection layer"
  PASS=$((PASS+1))
else
  echo "FAIL: export_functions DB access not unified"
  FAIL=$((FAIL+1))
fi

# --- No hardcoded passwords in codebase ---
if ! grep -rqE "password\s*=\s*['\"][^'\"]{8,}['\"]" tythe_time_tracker/ export_functions.py app.py 2>/dev/null; then
  echo "PASS: no hardcoded passwords found"
  PASS=$((PASS+1))
else
  echo "FAIL: possible hardcoded password"
  FAIL=$((FAIL+1))
fi

# --- services.py StaffSummary matches models.py (employee not employee_name) ---
if grep -q "StaffSummary(" tythe_time_tracker/core/services.py 2>/dev/null; then
  if grep -q "employee=" tythe_time_tracker/core/services.py 2>/dev/null; then
    echo "PASS: StaffSummary uses correct field (employee)"
    PASS=$((PASS+1))
  else
    echo "FAIL: StaffSummary field mismatch (models has employee)"
    FAIL=$((FAIL+1))
  fi
else
  echo "PASS: StaffSummary usage"
  PASS=$((PASS+1))
fi

# --- Streamlit not in core/database ---
if ! grep -rIq "import streamlit\|st\." tythe_time_tracker/core/ tythe_time_tracker/database/ 2>/dev/null; then
  echo "PASS: Streamlit not in core or database"
  PASS=$((PASS+1))
else
  echo "FAIL: Streamlit still in core or database"
  FAIL=$((FAIL+1))
fi

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
