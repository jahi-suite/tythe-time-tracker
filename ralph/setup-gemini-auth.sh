#!/usr/bin/env bash
# Setup Gemini API key for Ralph. Run once, then run Ralph loops.
# Usage: ./ralph/setup-gemini-auth.sh [API_KEY]
#   If API_KEY omitted, prompts for it (recommended - key not in shell history).

set -euo pipefail

GEMINI_DIR="${HOME}/.gemini"
SETTINGS_FILE="$GEMINI_DIR/settings.json"

if [ -n "${1:-}" ]; then
  API_KEY="$1"
else
  echo "Get your key at: https://aistudio.google.com/apikey"
  read -rs -p "Paste your Gemini API key: " API_KEY
  echo ""
  [ -z "$API_KEY" ] && { echo "No key provided." >&2; exit 1; }
fi

mkdir -p "$GEMINI_DIR"
echo '{"apiKey":"'"$API_KEY"'"}' > "$SETTINGS_FILE"
chmod 600 "$SETTINGS_FILE"

echo "Wrote $SETTINGS_FILE"
echo "Test with: gemini -p 'say hello'"
