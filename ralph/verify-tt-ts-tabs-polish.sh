#!/usr/bin/env bash
# Verification for tt-ts-tabs-polish-20260223
# Checks that tabs have readable text (dark on light)

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CSS="$REPO_ROOT/tt-ts/src/client/index.css"

if [ ! -f "$CSS" ]; then
  echo "FAIL: index.css not found"
  exit 1
fi

# tabs-01: Base .tabs button rule (inactive) must have explicit color
if ! grep "\.tabs button {" "$CSS" 2>/dev/null | grep -q "color"; then
  echo "FAIL: tabs-01 — .tabs button needs color: var(--tt-text) for readable inactive tabs"
  exit 1
fi

# Build must pass
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || exit 1

echo "OK: Tabs polish verification passed"
exit 0
