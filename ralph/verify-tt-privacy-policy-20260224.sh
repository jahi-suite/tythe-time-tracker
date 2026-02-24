#!/usr/bin/env bash
# Verification for tt-privacy-policy-20260224
# Privacy Policy page, route, footer link

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRIVACY_PAGE="$REPO_ROOT/tt-ts/src/client/pages/PrivacyPage.tsx"
APP="$REPO_ROOT/tt-ts/src/client/App.tsx"
MARKETING="$REPO_ROOT/tt-ts/public/kari-time-marketing.html"

if [ ! -f "$PRIVACY_PAGE" ]; then
  echo "FAIL: PrivacyPage.tsx not found"
  exit 1
fi

# Privacy content: must contain key sections
if ! grep -qi "Privacy" "$PRIVACY_PAGE"; then
  echo "FAIL: 'Privacy' not found in PrivacyPage.tsx"
  exit 1
fi
if ! grep -qiE "personal data|data we collect" "$PRIVACY_PAGE"; then
  echo "FAIL: 'personal data' or 'data we collect' not found in PrivacyPage.tsx"
  exit 1
fi
if ! grep -qiE "retention|how long" "$PRIVACY_PAGE"; then
  echo "FAIL: 'retention' or 'how long' not found in PrivacyPage.tsx"
  exit 1
fi
if ! grep -qiE "rights|access|correction|deletion" "$PRIVACY_PAGE"; then
  echo "FAIL: user rights (access, correction, deletion) not found in PrivacyPage.tsx"
  exit 1
fi

# Route exists in App.tsx
if ! grep -q "/privacy" "$APP"; then
  echo "FAIL: /privacy route not found in App.tsx"
  exit 1
fi
if ! grep -q "PrivacyPage" "$APP"; then
  echo "FAIL: PrivacyPage not imported/used in App.tsx"
  exit 1
fi

# Marketing footer has link to /privacy
if ! grep -q 'href="/privacy"' "$MARKETING"; then
  echo "FAIL: Marketing footer does not have link to /privacy"
  exit 1
fi

# tt-ts build passes
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || {
  echo "FAIL: tt-ts build failed"
  exit 1
}

echo "OK: Privacy Policy verification passed"
exit 0
