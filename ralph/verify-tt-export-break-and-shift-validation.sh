#!/usr/bin/env bash
# Verification for tt-export-break-and-shift-validation-20260223
# Part A: Break clarity in exports | Part B: Add shift validation

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Part A: break-clarity — "Break Deducted" or similar in exports
if ! grep -qE "Break Deducted|break.*deduct|Break deducted" "$REPO_ROOT/export_functions.py" 2>/dev/null; then
  echo "FAIL: break-clarity — Python export missing Break Deducted column/note"
  exit 1
fi

if ! grep -qE "Break Deducted|break.*deduct|Break deducted" "$REPO_ROOT/tt-ts/src/server/services/exportService.ts" 2>/dev/null; then
  echo "FAIL: break-clarity — TypeScript export missing Break Deducted column/note"
  exit 1
fi

# Part B: shift-val — validation against users (case-insensitive)
if ! grep -qE "not found|display_name|getAllUsers|get_all_users" "$REPO_ROOT/tt-ts/src/server/services/timeTracking.ts" 2>/dev/null; then
  echo "FAIL: shift-val — TypeScript addShift/editShift missing user validation"
  exit 1
fi

if ! grep -qE "not found|display_name|get_all_users" "$REPO_ROOT/tythe_time_tracker/core/services.py" 2>/dev/null; then
  echo "FAIL: shift-val — Python add_shift_manually/edit_shift missing user validation"
  exit 1
fi

# Build and tests
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || {
  echo "FAIL: tt-ts build failed"
  exit 1
}

cd "$REPO_ROOT"
PYTHON="${REPO_ROOT}/.venv/bin/python"
[[ -x "$PYTHON" ]] || PYTHON=python
$PYTHON -m pytest tests/unit/test_shift_splitting.py -q 2>/dev/null || {
  echo "FAIL: Python shift splitting tests failed"
  exit 1
}

echo "OK: Export break clarity + shift validation verification passed"
exit 0
