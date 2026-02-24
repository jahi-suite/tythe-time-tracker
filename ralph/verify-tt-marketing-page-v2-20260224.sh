#!/usr/bin/env bash
# Verification for tt-marketing-page-v2-20260224
# Full RALPH rewrite: Constance hero, late-night aesthetic, outcome-first

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PAGE="$REPO_ROOT/tt-ts/src/client/pages/MarketingLandingPage.tsx"

if [ ! -f "$PAGE" ]; then
  echo "FAIL: MarketingLandingPage.tsx not found"
  exit 1
fi

# Constance story must be in hero or first major section (not buried)
if ! grep -q "Constance\|scraps of paper\|bar manager" "$PAGE"; then
  echo "FAIL: Constance origin story (scraps of paper, bar manager) must be prominent"
  exit 1
fi

# Must have late-night / dark aesthetic (navy, near-black, amber, gold)
if ! grep -qE "navy|slate-9|gray-9|amber|gold|#0f172a|#1e293b|#f59e0b|#fbbf24" "$PAGE"; then
  if ! grep -qE "bg-\[#|from-\[#|to-\[#" "$PAGE"; then
    echo "FAIL: Page should use late-night venue aesthetic (dark bg, amber/gold accents)"
    exit 1
  fi
fi

# Must NOT use generic SaaS CTA "Get started. No credit card"
if grep -q "Get started. No credit card" "$PAGE"; then
  echo "FAIL: Replace generic CTA with something specific and vivid"
  exit 1
fi

# Must have outcome-first or vivid pain (not just spec-sheet features)
if ! grep -qE "close your laptop|payroll is done|feel|knowing|11pm|Monday|chaos|nightmare" "$PAGE"; then
  echo "FAIL: Page should have outcome-first copy or vivid pain (11pm, Monday, chaos, etc.)"
  exit 1
fi

# tt-ts build must pass
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || {
  echo "FAIL: tt-ts build failed"
  exit 1
}

echo "OK: Marketing page v2 verification passed"
exit 0
