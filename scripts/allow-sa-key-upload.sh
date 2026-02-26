#!/usr/bin/env bash
# Allow service account key uploads for a GAM project (bypasses org policy).
# Usage: ./scripts/allow-sa-key-upload.sh [PROJECT_ID]
# Default project: gam-project-w6t3d (or gam-project-qr978 from earlier GAM runs)
set -e

PROJECT_ID="${1:-gam-project-w6t3d}"
ORG_ID="329160300408"

echo "Disabling iam.disableServiceAccountKeyUpload for project: $PROJECT_ID"
echo ""

# Disable enforcement at project level (overrides org policy for this project)
gcloud resource-manager org-policies disable-enforce \
  iam.disableServiceAccountKeyUpload \
  --project="$PROJECT_ID"

echo ""
echo "If GAM created a different project (e.g. gam-project-qr978), run:"
echo "  ./scripts/allow-sa-key-upload.sh gam-project-qr978"
echo ""
echo "Then retry: gam oauth create"
