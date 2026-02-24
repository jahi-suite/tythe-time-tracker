#!/usr/bin/env bash
# Verification for tt-marketing-pdf-brochure-20260224
# Brochure-style marketing PDF

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$REPO_ROOT/tt-ts/scripts/generate-marketing-pdf.mjs"
PDF="$REPO_ROOT/tt-ts/marketing-page.pdf"

if [ ! -f "$SCRIPT" ]; then
  echo "FAIL: generate-marketing-pdf.mjs not found"
  exit 1
fi

# Script must have multi-page layout (brochure = more than one page)
if ! grep -q "addPage" "$SCRIPT" 2>/dev/null; then
  echo "FAIL: Script should use addPage() for multi-page brochure layout"
  exit 1
fi

# Script must have visual design elements (rect, fill for accent bars/boxes)
if ! grep -qE "rect\(|\.fill\(" "$SCRIPT" 2>/dev/null; then
  echo "FAIL: Script should use rect/fill for brochure visual design"
  exit 1
fi

# Script must use barn palette colors
if ! grep -qE "#1e3a2a|#c4a574|#faf8f5" "$SCRIPT" 2>/dev/null; then
  echo "FAIL: Script should use barn palette (green, tan, cream)"
  exit 1
fi

# Run script and check PDF is produced
cd "$REPO_ROOT/tt-ts" && node scripts/generate-marketing-pdf.mjs 2>/dev/null || {
  echo "FAIL: Script failed to run"
  exit 1
}

if [ ! -f "$PDF" ]; then
  echo "FAIL: PDF not generated at tt-ts/marketing-page.pdf"
  exit 1
fi

# PDF should be reasonably sized (brochure has more structure = different size)
SIZE=$(stat -c%s "$PDF" 2>/dev/null || stat -f%z "$PDF" 2>/dev/null)
if [ "$SIZE" -lt 5000 ]; then
  echo "FAIL: PDF seems too small ($SIZE bytes) — may be empty or broken"
  exit 1
fi

echo "OK: Marketing PDF brochure verification passed"
exit 0
