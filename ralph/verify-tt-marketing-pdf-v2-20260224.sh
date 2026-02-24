#!/usr/bin/env bash
# Verification for tt-marketing-pdf-v2-20260224
# PDF synced to v2 marketing page

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$REPO_ROOT/tt-ts/scripts/generate-marketing-pdf.mjs"
PDF="$REPO_ROOT/tt-ts/marketing-page.pdf"
PAGE="$REPO_ROOT/tt-ts/src/client/pages/MarketingLandingPage.tsx"

if [ ! -f "$SCRIPT" ]; then
  echo "FAIL: generate-marketing-pdf.mjs not found"
  exit 1
fi

# PDF must use v2 aesthetic (dark/amber) or sync from v2 page
if [ -f "$PAGE" ] && grep -qE "navy|slate-9|amber|#0f172a|#1e293b" "$PAGE" 2>/dev/null; then
  # v2 page has dark aesthetic — PDF should match
  if ! grep -qE "#0f172a|#1e293b|#f59e0b|#fbbf24|0f172a|1e293b|f59e0b" "$SCRIPT" 2>/dev/null; then
    echo "FAIL: PDF script should use v2 late-night palette (navy, amber)"
    exit 1
  fi
fi

# PDF must have addPage (multi-page brochure)
if ! grep -q "addPage" "$SCRIPT" 2>/dev/null; then
  echo "FAIL: PDF script should use addPage for multi-page layout"
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

# If v2 page exists, PDF should reference Constance/scraps (synced copy)
if [ -f "$PAGE" ] && grep -q "Constance\|scraps of paper" "$PAGE" 2>/dev/null; then
  if ! grep -q "Constance\|scraps of paper" "$SCRIPT" 2>/dev/null; then
    echo "FAIL: PDF script should include v2 copy (Constance, scraps of paper)"
    exit 1
  fi
fi

echo "OK: Marketing PDF v2 verification passed"
exit 0
