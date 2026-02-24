#!/usr/bin/env bash
# Deploy karisuite-site to Cloud Run.
# Run from repo root: ./karisuite-site/deploy.sh
set -e

cd "$(dirname "$0")"
PROJECT="${GCP_PROJECT_ID:-karitime}"
REGION="europe-west2"
SERVICE="karisuite-site"

echo "Deploying $SERVICE to Cloud Run ($REGION, project $PROJECT)..."
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --project "$PROJECT" \
  --allow-unauthenticated

echo "Done. Map karisuite.com and www.karisuite.com in Cloud Run Domain mappings."
