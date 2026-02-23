#!/usr/bin/env bash
# Verification for tt-ts-corporate-polish-20260223
# Checks that corporate polish elements are in place

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT="$REPO_ROOT/tt-ts/src/client"

if [ ! -d "$CLIENT" ]; then
  echo "FAIL: tt-ts client not found"
  exit 1
fi

# polish-01: Header has Tythe logo or branding
if ! grep -qE "tythe-logo|Employee Portal" "$CLIENT/pages/Layout.tsx" 2>/dev/null; then
  echo "FAIL: polish-01 — Header branding not found"
  exit 1
fi

# polish-02: Sidebar has link list (Link/NavLink or sidebar-nav-link buttons)
if ! grep -qE "Link|NavLink|sidebar-nav-link" "$CLIENT/pages/Layout.tsx" 2>/dev/null; then
  echo "FAIL: polish-02 — Sidebar link list not found"
  exit 1
fi

# polish-03: Message CSS classes
if ! grep -qE "message-success|message-error|message-info" "$CLIENT/index.css" 2>/dev/null; then
  echo "FAIL: polish-03 — Message CSS classes not found"
  exit 1
fi

# polish-04: Form input styling (background, border)
if ! grep -qE "background.*#f|background.*#fff|border.*#d6dee8" "$CLIENT/index.css" 2>/dev/null; then
  echo "FAIL: polish-04 — Form input styling not found"
  exit 1
fi

# polish-05: Card styling
if ! grep -qE "\.card|border-radius.*10|box-shadow" "$CLIENT/index.css" 2>/dev/null; then
  echo "FAIL: polish-05 — Card styling not found"
  exit 1
fi

# Build must pass
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || exit 1

echo "OK: Corporate polish verification passed"
exit 0
