#!/usr/bin/env bash
# Verification for tt-ts-app-dashboard-style-20260223
# Ensures dashboard style applied across whole app

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CSS="$REPO_ROOT/tt-ts/src/client/index.css"
CLOCK="$REPO_ROOT/tt-ts/src/client/pages/ClockPage.tsx"
TIMESHEET="$REPO_ROOT/tt-ts/src/client/pages/TimesheetPage.tsx"
EXPORT="$REPO_ROOT/tt-ts/src/client/pages/ExportPage.tsx"
MANAGER="$REPO_ROOT/tt-ts/src/client/pages/ManagerPage.tsx"
LAYOUT="$REPO_ROOT/tt-ts/src/client/pages/Layout.tsx"

if [ ! -f "$CSS" ]; then
  echo "FAIL: index.css not found"
  exit 1
fi

# style-01: shared CSS (stat-card, cards-grid)
if ! grep -qE "stat-card|\.cards-grid" "$CSS" 2>/dev/null; then
  echo "FAIL: style-01 — stat-card or cards-grid not found in index.css"
  exit 1
fi

# style-02: ClockPage stat cards
if ! grep -qE "stat-card|stat-value" "$CLOCK" 2>/dev/null; then
  echo "FAIL: style-02 — stat-card or stat-value not found in ClockPage.tsx"
  exit 1
fi

# style-03: TimesheetPage stat cards
if ! grep -qE "stat-card|stat-value" "$TIMESHEET" 2>/dev/null; then
  echo "FAIL: style-03 — stat-card or stat-value not found in TimesheetPage.tsx"
  exit 1
fi

# style-04: ExportPage stat cards or card grid
if ! grep -qE "stat-card|cards-grid|stat-value" "$EXPORT" 2>/dev/null; then
  echo "FAIL: style-04 — stat-card, cards-grid, or stat-value not found in ExportPage.tsx"
  exit 1
fi

# style-05: ManagerPage View All Entries — shift/entry cards, no ul for entries
if ! grep -qE "shift-card|entry-card|user-cards-grid|entries-cards-grid" "$MANAGER" 2>/dev/null; then
  echo "FAIL: style-05 — shift-card, entry-card, or cards grid not found for View All Entries"
  exit 1
fi
# Check entries block only: from "tab === 'entries'" to next "tab ==="
if awk '/tab === .entries./{f=1;next} f && /tab === .(add|users|audit|edit|delete)./{exit} f && /<ul>/{print;exit}' "$MANAGER" 2>/dev/null | grep -q "<ul>"; then
  echo "FAIL: style-05 — View All Entries still uses ul/li for shift list"
  exit 1
fi

# style-06: ManagerPage Audit Log — audit cards, no ul for audit
if ! grep -qE "audit-card|audit-log|audit-cards" "$MANAGER" 2>/dev/null; then
  echo "FAIL: style-06 — audit-card or audit-log not found in ManagerPage.tsx"
  exit 1
fi
if grep -A 50 "tab === 'audit'" "$MANAGER" 2>/dev/null | grep -q "<ul>"; then
  echo "FAIL: style-06 — Audit Log still uses ul/li"
  exit 1
fi

# style-07: forms use card (already use .card; just ensure build works)
# style-08: sidebar polish — check for dashboard-related classes
if ! grep -qE "sidebar-card|sidebar-avatar|stat-card|dashboard|user-info|sidebar-nav|pay-rate-info" "$LAYOUT" 2>/dev/null; then
  echo "FAIL: style-08 — Layout sidebar structure not found"
  exit 1
fi

# style-09: build passes
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || {
  echo "FAIL: style-09 — tt-ts build failed"
  exit 1
}

echo "OK: App-wide dashboard style verification passed"
exit 0
