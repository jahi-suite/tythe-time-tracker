#!/usr/bin/env bash
# voice-to-spec.sh — record or accept an audio file, transcribe via Whisper, start spec session
#
# Transcription (in order of preference):
#   1. Local whisper CLI   — no API key needed: pip install openai-whisper
#   2. OpenAI Whisper API  — set OPENAI_API_KEY in .env or shell
#
# Usage:
#   ./scripts/voice-to-spec.sh              # live recording (requires working audio)
#   ./scripts/voice-to-spec.sh idea.m4a     # use an existing audio file

set -euo pipefail

TMPFILE=$(mktemp /tmp/voice-XXXXXX.wav)
trap 'rm -f "$TMPFILE"' EXIT

# ── Pick transcription method ─────────────────────────────────────────────────
if command -v whisper &>/dev/null; then
  TRANSCRIBE_METHOD="local"
else
  # Try loading OPENAI_API_KEY from .env
  if [[ -f ".env" ]]; then
    export $(grep -E '^OPENAI_API_KEY=' .env | xargs) 2>/dev/null || true
  fi
  if [[ -n "${OPENAI_API_KEY:-}" ]]; then
    TRANSCRIBE_METHOD="api"
  else
    echo "No transcription method available." >&2
    echo "" >&2
    echo "Install local Whisper (no API key needed):" >&2
    echo "  pip install openai-whisper" >&2
    echo "" >&2
    echo "Or set OPENAI_API_KEY in your .env file to use the OpenAI API." >&2
    exit 1
  fi
fi

# ── Get audio ────────────────────────────────────────────────────────────────
if [[ -n "${1:-}" ]]; then
  INPUT_FILE="$1"
  if [[ ! -f "$INPUT_FILE" ]]; then
    echo "Error: file not found: $INPUT_FILE" >&2
    exit 1
  fi
  echo "Using file: $INPUT_FILE"
  ffmpeg -y -i "$INPUT_FILE" -ar 16000 -ac 1 "$TMPFILE" -loglevel error
else
  echo ""
  echo "Speak your feature idea. Press Ctrl+C when done."
  echo ""
  if ffmpeg -y -f pulse -i default -ar 16000 -ac 1 "$TMPFILE" -loglevel error 2>/dev/null; then
    :
  elif ffmpeg -y -f alsa -i default -ar 16000 -ac 1 "$TMPFILE" -loglevel error 2>/dev/null; then
    :
  else
    echo "" >&2
    echo "Live recording not available (no audio input detected in WSL2)." >&2
    echo "" >&2
    echo "Record on your phone instead, then run:" >&2
    echo "  make voice FILE=path/to/recording.m4a" >&2
    exit 1
  fi
fi

# ── Transcribe ────────────────────────────────────────────────────────────────
echo ""
echo "Transcribing..."

if [[ "$TRANSCRIBE_METHOD" == "local" ]]; then
  TXTFILE=$(mktemp /tmp/voice-XXXXXX)
  trap 'rm -f "$TMPFILE" "$TXTFILE.txt"' EXIT
  whisper "$TMPFILE" --model small --output_format txt --output_dir "$(dirname "$TXTFILE")" \
    --output_filename "$(basename "$TXTFILE")" --verbose False 2>/dev/null
  TRANSCRIPT=$(cat "${TXTFILE}.txt" 2>/dev/null || echo "")
else
  TRANSCRIPT=$(curl -s https://api.openai.com/v1/audio/transcriptions \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F model="whisper-1" \
    -F file="@$TMPFILE" \
    | jq -r '.text')
fi

if [[ -z "$TRANSCRIPT" ]] || [[ "$TRANSCRIPT" == "null" ]]; then
  echo "Error: transcription failed or returned empty." >&2
  exit 1
fi

echo ""
echo "─────────────────────────────────"
echo "Transcribed:"
echo "$TRANSCRIPT"
echo "─────────────────────────────────"
echo ""

# ── Start spec session ────────────────────────────────────────────────────────
CLAUDE_BIN="claude"
if ! command -v claude &>/dev/null; then
  CLAUDE_BIN="$HOME/.local/bin/claude"
fi

{
  cat PROMPT_spec.md
  echo ""
  echo "---"
  echo ""
  echo "The user recorded the following voice note describing their feature idea:"
  echo ""
  echo "$TRANSCRIPT"
  echo ""
  echo "Use this as the starting point. Ask any clarifying questions needed, then draft the spec."
} | "$CLAUDE_BIN" --model opus
