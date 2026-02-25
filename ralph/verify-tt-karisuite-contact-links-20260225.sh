#!/usr/bin/env bash
# Verify: tt-karisuite-contact-links-20260225
# Contact jahi@karisuite.com, Powered by → karisuite.com (not time.karisuite)
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PASS=0
FAIL=0

# --- No hello@ anywhere ---
if ! grep -rq "hello@" tt-ts/ karisuite-site/ 2>/dev/null; then
  echo "PASS: no hello@ in tt-ts or karisuite-site"
  PASS=$((PASS+1))
else
  echo "FAIL: hello@ still present (should be jahi@)"
  FAIL=$((FAIL+1))
fi

# --- jahi@karisuite.com in privacy + marketing ---
if grep -q "jahi@karisuite.com" tt-ts/public/privacy-policy.html 2>/dev/null && \
   grep -q "jahi@karisuite.com" tt-ts/public/kari-time-marketing.html 2>/dev/null; then
  echo "PASS: jahi@ in tt-ts privacy and marketing"
  PASS=$((PASS+1))
else
  echo "FAIL: jahi@ missing from tt-ts"
  FAIL=$((FAIL+1))
fi

# --- karisuite-site has jahi@ and no hello@ ---
if [ ! -d karisuite-site ]; then
  echo "PASS: karisuite-site not present, skip"
  PASS=$((PASS+1))
elif ! grep -rq "hello@" karisuite-site/ 2>/dev/null && grep -rq "jahi@karisuite.com" karisuite-site/ 2>/dev/null; then
  echo "PASS: karisuite-site has jahi@, no hello@"
  PASS=$((PASS+1))
else
  echo "FAIL: karisuite-site has hello@ or missing jahi@"
  FAIL=$((FAIL+1))
fi

# --- Powered by Kari Suite links to karisuite.com (not time.karisuite) ---
if grep -qE "karisuite\.com.*Kari Suite|Kari Suite.*karisuite\.com" tt-ts/public/kari-time-marketing.html 2>/dev/null && \
   grep -qE "karisuite\.com.*Kari Suite|Kari Suite.*karisuite\.com" tt-ts/public/privacy-policy.html 2>/dev/null && \
   grep -q "karisuite.com" tt-ts/src/client/pages/Layout.tsx 2>/dev/null; then
  echo "PASS: Powered by Kari Suite links to karisuite.com"
  PASS=$((PASS+1))
else
  echo "FAIL: Powered by Kari Suite not linking to karisuite.com"
  FAIL=$((FAIL+1))
fi

# --- Lines with "Powered by" must not link to time.karisuite ---
WRONG=$(grep -r "Powered by" tt-ts/ karisuite-site/ 2>/dev/null | grep "time\.karisuite" || true)
if [ -z "$WRONG" ]; then
  echo "PASS: Powered by does not link to time.karisuite"
  PASS=$((PASS+1))
else
  echo "FAIL: Powered by links to time.karisuite"
  FAIL=$((FAIL+1))
fi

# --- tt-ts build passes ---
cd tt-ts && npm run build 2>/dev/null || { echo "FAIL: tt-ts build failed"; exit 1; }
cd "$REPO_ROOT"
echo "PASS: tt-ts build"
PASS=$((PASS+1))

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
