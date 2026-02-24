#!/usr/bin/env bash
# Verification for tt-marketing-pdf-fix-blank-pages-20260224
# PDF must have exactly 5 pages, no blank extras

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$REPO_ROOT/tt-ts/scripts/generate-marketing-pdf.mjs"
PDF="$REPO_ROOT/tt-ts/marketing-page.pdf"

if [ ! -f "$SCRIPT" ]; then
  echo "FAIL: generate-marketing-pdf.mjs not found"
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

# Count pages using pdfinfo (poppler-utils) or pdftk, or fallback to grep
PAGES=0
if command -v pdfinfo &>/dev/null; then
  PAGES=$(pdfinfo "$PDF" 2>/dev/null | grep -oP 'Pages:\s+\K\d+' || echo 0)
elif command -v pdftk &>/dev/null; then
  PAGES=$(pdftk "$PDF" dump_data 2>/dev/null | grep -oP 'NumberOfPages: \K\d+' || echo 0)
else
  # Fallback: count page objects, excluding the /Pages tree object
  PAGES=$(strings "$PDF" 2>/dev/null | grep -Ec '/Type /Page($|[^s])' || echo 0)
fi

if [ "$PAGES" -eq 0 ]; then
  echo "FAIL: Could not determine page count (install pdfinfo or pdftk)"
  exit 1
fi

if [ "$PAGES" -gt 5 ]; then
  echo "FAIL: PDF has $PAGES pages (expected 5). Remove blank pages."
  exit 1
fi

if [ "$PAGES" -lt 5 ]; then
  echo "FAIL: PDF has $PAGES pages (expected 5)"
  exit 1
fi

echo "OK: Marketing PDF has exactly 5 pages"
exit 0
