#!/usr/bin/env bash
# Verification for tt-ts-parity-20260223
# Passes when: build succeeds AND key parity features are present

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# 1. Build must pass
cd tt-ts && npm run build 2>/dev/null || exit 1
cd "$REPO_ROOT"

# 2. Manager page must NOT have the placeholder for add/edit/delete
if grep -q "Full add/edit/delete forms would go here" tt-ts/src/client/pages/ManagerPage.tsx 2>/dev/null; then
  echo "FAIL: Manager add/edit/delete still placeholder"
  exit 1
fi

# 3. Manager page must have Add Shift form (employee + clock fields)
if ! grep -qE "employeeName|Add Shift|shifts\.add" tt-ts/src/client/pages/ManagerPage.tsx 2>/dev/null; then
  echo "FAIL: Add Shift form not implemented"
  exit 1
fi

# 4. Manage Users must have Create User form
if ! grep -qE "Create User|Create New User|users\.create" tt-ts/src/client/pages/ManagerPage.tsx 2>/dev/null; then
  echo "FAIL: Manage Users Create form not implemented"
  exit 1
fi

# 5. Manage Users must have Activate/Deactivate
if ! grep -qE "activate|deactivate|users\.(activate|deactivate)" tt-ts/src/client/pages/ManagerPage.tsx 2>/dev/null; then
  echo "FAIL: Manage Users Activate/Deactivate not implemented"
  exit 1
fi

echo "OK: Parity verification passed"
exit 0
