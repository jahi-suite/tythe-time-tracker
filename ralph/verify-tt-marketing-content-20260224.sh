#!/usr/bin/env bash
# Verification for tt-marketing-content-20260224
# Marketing copy: origin story, pay rates, Constance testimonial

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PAGE="$REPO_ROOT/tt-ts/src/client/pages/MarketingLandingPage.tsx"

if [ ! -f "$PAGE" ]; then
  echo "FAIL: MarketingLandingPage.tsx not found"
  exit 1
fi

# Constance present
if ! grep -q "Constance" "$PAGE"; then
  echo "FAIL: Constance not found in MarketingLandingPage.tsx"
  exit 1
fi

# Bar Manager present
if ! grep -qi "bar manager" "$PAGE"; then
  echo "FAIL: Bar Manager not found in MarketingLandingPage.tsx"
  exit 1
fi

# Scraps of paper (or scrap) present
if ! grep -qi "scrap" "$PAGE"; then
  echo "FAIL: scrap(s) of paper not found in MarketingLandingPage.tsx"
  exit 1
fi

# Custom pay rates mentioned
if ! grep -qi "custom" "$PAGE"; then
  echo "FAIL: custom (pay rates) not found in MarketingLandingPage.tsx"
  exit 1
fi
if ! grep -qi "rate" "$PAGE"; then
  echo "FAIL: rate(s) not found in MarketingLandingPage.tsx"
  exit 1
fi

# Fake testimonials removed
if grep -q "Sarah Mitchell" "$PAGE"; then
  echo "FAIL: Sarah Mitchell (fake testimonial) still present"
  exit 1
fi
if grep -q "James Chen" "$PAGE"; then
  echo "FAIL: James Chen (fake testimonial) still present"
  exit 1
fi

# tt-ts build passes
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || {
  echo "FAIL: tt-ts build failed"
  exit 1
}

echo "OK: Marketing content verification passed"
exit 0
