#!/usr/bin/env bash
# Verification for tt-streamlit-desktop-contrast-20260223
# Checks that desktop-specific contrast CSS is in place

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PY="$REPO_ROOT/tythe_time_tracker/ui/app.py"

if [ ! -f "$APP_PY" ]; then
  echo "FAIL: app.py not found"
  exit 1
fi

# Must have desktop-specific media query
if ! grep -q "@media (min-width: 769px)" "$APP_PY" 2>/dev/null; then
  echo "FAIL: @media (min-width: 769px) not found in app.py"
  exit 1
fi

# Must target selectbox (stSelectbox or data-baseweb select)
if ! grep -qE "stSelectbox|data-baseweb.*select" "$APP_PY" 2>/dev/null; then
  echo "FAIL: selectbox selectors not found in app.py"
  exit 1
fi

# Must have light background for form controls
if ! grep -qE "background.*#f|background.*white|background.*#fff|background-color.*#f|background-color.*#fff" "$APP_PY" 2>/dev/null; then
  echo "FAIL: light background for form controls not found"
  exit 1
fi

# Must have dark text color
if ! grep -qE "color.*#1e2a36|color.*#142434" "$APP_PY" 2>/dev/null; then
  echo "FAIL: dark text color (#1e2a36 or #142434) not found"
  exit 1
fi

echo "OK: Desktop contrast verification passed"
exit 0
