#!/usr/bin/env bash
# Verification for tt-terms-conditions-20260224
# Terms and Conditions page, route, footer link

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TERMS_PAGE="$REPO_ROOT/tt-ts/src/client/pages/TermsPage.tsx"
APP="$REPO_ROOT/tt-ts/src/client/App.tsx"
MARKETING="$REPO_ROOT/tt-ts/public/kari-time-marketing.html"

if [ ! -f "$TERMS_PAGE" ]; then
  echo "FAIL: TermsPage.tsx not found"
  exit 1
fi

# Terms content: must contain key sections
if ! grep -qi "Terms" "$TERMS_PAGE"; then
  echo "FAIL: 'Terms' not found in TermsPage.tsx"
  exit 1
fi
if ! grep -qi "acceptable use" "$TERMS_PAGE"; then
  echo "FAIL: 'acceptable use' not found in TermsPage.tsx"
  exit 1
fi
if ! grep -qi "liability" "$TERMS_PAGE"; then
  echo "FAIL: 'liability' not found in TermsPage.tsx"
  exit 1
fi
if ! grep -qiE "data|personal data" "$TERMS_PAGE"; then
  echo "FAIL: 'data' or 'personal data' not found in TermsPage.tsx"
  exit 1
fi

# Route exists in App.tsx
if ! grep -q "/terms" "$APP"; then
  echo "FAIL: /terms route not found in App.tsx"
  exit 1
fi
if ! grep -q "TermsPage" "$APP"; then
  echo "FAIL: TermsPage not imported/used in App.tsx"
  exit 1
fi

# Marketing footer has link to /terms
if ! grep -q 'href="/terms"' "$MARKETING"; then
  echo "FAIL: Marketing footer does not have link to /terms"
  exit 1
fi

# tt-ts build passes
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || {
  echo "FAIL: tt-ts build failed"
  exit 1
}

echo "OK: Terms and Conditions verification passed"
exit 0
