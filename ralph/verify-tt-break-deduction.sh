#!/usr/bin/env bash
# Verification for tt-break-deduction-20260223
# 20-minute unpaid break for 6+ hour shifts

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# break-01/02: Python apply_break_deduction exists and is used
if ! grep -qE "apply_break_deduction|break_deduction" "$REPO_ROOT/export_functions.py" 2>/dev/null; then
  echo "FAIL: break-01 — apply_break_deduction not found in export_functions.py"
  exit 1
fi

# break-03: TypeScript applyBreakDeduction exists and is used
if ! grep -qE "applyBreakDeduction|breakDeduction" "$REPO_ROOT/tt-ts/src/server/services/exportUtils.ts" 2>/dev/null; then
  echo "FAIL: break-03 — applyBreakDeduction not found in exportUtils.ts"
  exit 1
fi

# break-04: Unit tests for break deduction
if ! grep -qE "break|6.*hour|20.*min" "$REPO_ROOT/tests/unit/test_shift_splitting.py" 2>/dev/null; then
  echo "FAIL: break-04 — break deduction tests not found in test_shift_splitting.py"
  exit 1
fi

# break-05: tt-ts build passes
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || {
  echo "FAIL: break-05 — tt-ts build failed"
  exit 1
}

# Python tests pass
cd "$REPO_ROOT" && python -m pytest tests/unit/test_shift_splitting.py -q 2>/dev/null || {
  echo "FAIL: break-05 — Python shift splitting tests failed"
  exit 1
}

echo "OK: Break deduction verification passed"
exit 0
