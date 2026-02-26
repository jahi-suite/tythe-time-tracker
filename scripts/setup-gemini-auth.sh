#!/usr/bin/env bash
# Setup Gemini API key for Ralph. Run once, then run Ralph loops.
# Usage: ./ralph/setup-gemini-auth.sh [API_KEY]
#   If API_KEY omitted, prompts for it (recommended - key not in shell history).
#
# Writes ~/.gemini/.env with GEMINI_API_KEY. Gemini CLI loads this automatically.

set -euo pipefail

GEMINI_DIR="${HOME}/.gemini"
ENV_FILE="$GEMINI_DIR/.env"

if [ -n "${1:-}" ]; then
  API_KEY="$1"
else
  echo "Get your key at: https://aistudio.google.com/apikey"
  read -rs -p "Paste your Gemini API key: " API_KEY
  echo ""
  [ -z "$API_KEY" ] && { echo "No key provided." >&2; exit 1; }
fi

mkdir -p "$GEMINI_DIR"
# Escape for safe use in double-quoted string
API_KEY_ESC="${API_KEY//\\/\\\\}"
API_KEY_ESC="${API_KEY_ESC//\"/\\\"}"
echo "GEMINI_API_KEY=\"$API_KEY_ESC\"" > "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo "Wrote $ENV_FILE"
echo "Test with: gemini -p 'say hello'"
