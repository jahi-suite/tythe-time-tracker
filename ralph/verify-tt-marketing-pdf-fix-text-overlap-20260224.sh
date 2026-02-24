#!/usr/bin/env bash
# Verification for tt-marketing-pdf-fix-text-overlap-20260224
# PDF must use dynamic y positioning to prevent overlap

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$REPO_ROOT/tt-ts/scripts/generate-marketing-pdf.mjs"
PDF="$REPO_ROOT/tt-ts/marketing-page.pdf"

if [ ! -f "$SCRIPT" ]; then
  echo "FAIL: generate-marketing-pdf.mjs not found"
  exit 1
fi

# Cover right panel MUST use measure/heightOfString for managerBody and managerBody2
if ! grep -q "measure" "$SCRIPT" 2>/dev/null; then
  echo "FAIL: Script should use measure() for text height"
  exit 1
fi
# managerBody2 must NOT be at fixed y=188 — must use dynamic y
if grep -q "managerBody2.*188\|188.*managerBody2" "$SCRIPT" 2>/dev/null; then
  echo "FAIL: managerBody2 must use dynamic y positioning, not fixed 188"
  exit 1
fi

# Run script
cd "$REPO_ROOT/tt-ts" && node scripts/generate-marketing-pdf.mjs 2>/dev/null || {
  echo "FAIL: Script failed to run"
  exit 1
}

if [ ! -f "$PDF" ]; then
  echo "FAIL: PDF not generated"
  exit 1
fi

echo "OK: Marketing PDF text overlap fix verification passed"
exit 0
