#!/usr/bin/env bash
# Verification for tt-marketing-pdf-fix-cover-gap-20260224
# CTA bar must be positioned near content, not at fixed bottom

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$REPO_ROOT/tt-ts/scripts/generate-marketing-pdf.mjs"
PDF="$REPO_ROOT/tt-ts/marketing-page.pdf"

if [ ! -f "$SCRIPT" ]; then
  echo "FAIL: generate-marketing-pdf.mjs not found"
  exit 1
fi

# CTA bar should NOT use h - 118 (fixed bottom) — should use content-based y
if grep -q "h - 118\|page\.height - 118" "$SCRIPT" 2>/dev/null; then
  echo "FAIL: CTA bar should use content-based positioning, not fixed h-118"
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

echo "OK: Marketing PDF cover gap fix verification passed"
exit 0
