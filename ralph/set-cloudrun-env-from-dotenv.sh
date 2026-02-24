#!/usr/bin/env bash
# Set Cloud Run env vars from tt-ts/.env via CLI.
# Run from repo root. Requires gcloud auth and tt-ts/.env to exist.
set -e

ENV_FILE="tt-ts/.env"
SERVICE="karitime"
REGION="europe-west2"
PROJECT="karitime"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

# Build YAML env file: use .env values, override SUPABASE_PORT=6543, NODE_ENV, SESSION_STORE
TMP=$(mktemp)
to_yaml() {
  while IFS='=' read -r k v; do
    [[ -z "$k" ]] && continue
    # Quote value for YAML safety
    printf '%s: "%s"\n' "$k" "${v//\"/\\\"}"
  done
}
grep -v '^#' "$ENV_FILE" | grep -v '^$' \
  | grep -v '^SUPABASE_PORT=' | grep -v '^NODE_ENV=' | grep -v '^SESSION_STORE=' \
  | to_yaml >> "$TMP"
echo 'SUPABASE_PORT: "6543"' >> "$TMP"
echo 'NODE_ENV: "production"' >> "$TMP"
echo 'SESSION_STORE: "pg"' >> "$TMP"

echo "Updating Cloud Run service $SERVICE with env vars from $ENV_FILE..."
gcloud run services update "$SERVICE" \
  --region="$REGION" \
  --project="$PROJECT" \
  --env-vars-file="$TMP"

rm -f "$TMP"
echo "Done."
