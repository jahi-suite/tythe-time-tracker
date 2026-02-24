#!/usr/bin/env bash
# Verification for tt-marketing-pdf-fix-bleed-and-cta-20260224
# No CTA in visible copy, script runs

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$REPO_ROOT/tt-ts/scripts/generate-marketing-pdf.mjs"
PDF="$REPO_ROOT/tt-ts/marketing-page.pdf"

if [ ! -f "$SCRIPT" ]; then
  echo "FAIL: generate-marketing-pdf.mjs not found"
  exit 1
fi

# CTA must not appear in user-facing copy (bar labels, page chrome)
if grep -q "Last orders CTA\|Testimonial + CTA" "$SCRIPT" 2>/dev/null; then
  echo "FAIL: Remove 'CTA' from visible copy (Last orders, Testimonial + CTA)"
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

echo "OK: Marketing PDF bleed and CTA fix verification passed"
exit 0
