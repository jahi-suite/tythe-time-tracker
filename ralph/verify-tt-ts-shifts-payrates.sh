#!/usr/bin/env bash
# Verification for tt-ts-shifts-payrates-20260223

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

cd tt-ts && npm run build 2>/dev/null || exit 1
cd "$REPO_ROOT"

# View All Entries must have Edit/Delete buttons that set entry ID and switch tab (on each row)
if ! grep -qE "setEditShiftEntryId\(s\.|setDeleteShiftEntryId\(s\.|editShiftEntryId.*s\.id" tt-ts/src/client/pages/ManagerPage.tsx 2>/dev/null; then
  echo "FAIL: View All Entries missing Edit/Delete buttons per row"
  exit 1
fi

# Manage Users must have pay rates (Standard, Enhanced, Supervisor or setPayRates)
if ! grep -qE "setPayRates|standard_rate|Standard.*£|Pay rates" tt-ts/src/client/pages/ManagerPage.tsx 2>/dev/null; then
  echo "FAIL: Manage Users missing pay rates form"
  exit 1
fi

echo "OK: Shifts + pay rates verification passed"
exit 0
