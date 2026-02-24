#!/usr/bin/env bash
# Verification for tt-cicd-github-gcp-20260224
# USER runs this script — agent does NOT run it.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0

# 1. Workflow file exists
WORKFLOW="$REPO_ROOT/.github/workflows/deploy-cloudrun.yml"
if [ ! -f "$WORKFLOW" ]; then
  echo "FAIL: .github/workflows/deploy-cloudrun.yml not found"
  FAIL=1
fi

# 2. Workflow triggers on push to main
if [ -f "$WORKFLOW" ] && ! grep -q "main" "$WORKFLOW"; then
  echo "FAIL: Workflow must trigger on push to main"
  FAIL=1
fi

# 3. Workflow uses GCP auth
if [ -f "$WORKFLOW" ] && ! grep -q "GCP_SA_KEY\|credentials_json\|google-github-actions/auth" "$WORKFLOW"; then
  echo "FAIL: Workflow must authenticate to GCP (GCP_SA_KEY or google-github-actions/auth)"
  FAIL=1
fi

# 4. Workflow deploys to Cloud Run
if [ -f "$WORKFLOW" ] && ! grep -q "gcloud run deploy\|deploy-cloudrun\|tythe-time-tracker" "$WORKFLOW"; then
  echo "FAIL: Workflow must deploy to Cloud Run (tythe-time-tracker)"
  FAIL=1
fi

# 5. CICD_SETUP.md exists
if [ ! -f "$REPO_ROOT/docs/CICD_SETUP.md" ]; then
  echo "FAIL: docs/CICD_SETUP.md not found"
  FAIL=1
fi

# 6. tt-ts build passes
if ! (cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null); then
  echo "FAIL: tt-ts build failed"
  FAIL=1
fi

if [ $FAIL -eq 0 ]; then
  echo "PASS: tt-cicd-github-gcp-20260224"
  exit 0
fi
exit 1
