#!/usr/bin/env bash
# Verification for tt-export-admin-20260223

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# _is_manager must include admin (manager OR admin)
if ! grep -qE 'admin|"manager".*"admin"|is_admin_or_manager' tythe_time_tracker/ui/pages/export_interface.py 2>/dev/null; then
  echo "FAIL: export_interface _is_manager does not include admin"
  exit 1
fi

echo "OK: Export admin verification passed"
exit 0
