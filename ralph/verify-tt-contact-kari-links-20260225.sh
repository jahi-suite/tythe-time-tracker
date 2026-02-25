#!/usr/bin/env bash
# Verify: tt-contact-kari-links-20260225
# Contact email jahi@karisuite.com, Powered by Kari Suite links to karisuite.com
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PASS=0
FAIL=0

# --- Build must pass ---
cd tt-ts && npm run build 2>/dev/null || { echo "FAIL: tt-ts build failed"; exit 1; }
cd "$REPO_ROOT"
echo "PASS: tt-ts build"
PASS=$((PASS+1))

# --- Contact email in privacy policy ---
if grep -q "jahi@karisuite.com" tt-ts/public/privacy-policy.html 2>/dev/null; then
  echo "PASS: contact email in privacy policy"
  PASS=$((PASS+1))
else
  echo "FAIL: contact email missing from privacy policy"
  FAIL=$((FAIL+1))
fi

# --- Contact us or email in marketing footer ---
if grep -qE "jahi@karisuite.com|Contact us" tt-ts/public/kari-time-marketing.html 2>/dev/null; then
  echo "PASS: contact in marketing footer"
  PASS=$((PASS+1))
else
  echo "FAIL: contact missing from marketing footer"
  FAIL=$((FAIL+1))
fi

# --- Powered by Kari Suite links to karisuite.com (not # or /) ---
if grep -qE "karisuite\.com.*Kari Suite|Kari Suite.*karisuite\.com" tt-ts/public/kari-time-marketing.html 2>/dev/null && \
   grep -qE "karisuite\.com.*Kari Suite|Kari Suite.*karisuite\.com" tt-ts/public/privacy-policy.html 2>/dev/null; then
  echo "PASS: Kari Suite links to karisuite.com in HTML pages"
  PASS=$((PASS+1))
else
  echo "FAIL: Kari Suite not linking to karisuite.com in HTML"
  FAIL=$((FAIL+1))
fi

# --- Layout footer has Kari Suite link ---
if grep -qE "karisuite\.com|https://karisuite" tt-ts/src/client/pages/Layout.tsx 2>/dev/null; then
  echo "PASS: Layout footer Kari Suite links to karisuite.com"
  PASS=$((PASS+1))
else
  echo "FAIL: Layout footer missing Kari Suite link to karisuite.com"
  FAIL=$((FAIL+1))
fi

# --- Links open in new tab (target="_blank") ---
if grep -q 'target="_blank"' tt-ts/public/kari-time-marketing.html 2>/dev/null && \
   grep -q 'target="_blank"' tt-ts/public/privacy-policy.html 2>/dev/null; then
  echo "PASS: Kari Suite links use target=_blank"
  PASS=$((PASS+1))
else
  echo "FAIL: Kari Suite links missing target=_blank"
  FAIL=$((FAIL+1))
fi

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
