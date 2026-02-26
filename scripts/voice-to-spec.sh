#!/usr/bin/env bash
# voice-to-spec.sh — record or accept an audio file, transcribe via Whisper, start spec session
#
# Usage:
#   ./scripts/voice-to-spec.sh              # live recording (requires working audio)
#   ./scripts/voice-to-spec.sh idea.m4a     # use an existing audio file

set -euo pipefail

TMPFILE=$(mktemp /tmp/voice-XXXXXX.wav)
trap 'rm -f "$TMPFILE"' EXIT

# ── Check for OPENAI_API_KEY ─────────────────────────────────────────────────
if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  # Try loading from .env
  if [[ -f ".env" ]]; then
    export $(grep -E '^OPENAI_API_KEY=' .env | xargs) 2>/dev/null || true
  fi
fi
if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "Error: OPENAI_API_KEY not set." >&2
  echo "Add it to your .env file or export it in your shell." >&2
  exit 1
fi

# ── Get audio ────────────────────────────────────────────────────────────────
if [[ -n "${1:-}" ]]; then
  # File provided — convert to wav for Whisper
  INPUT_FILE="$1"
  if [[ ! -f "$INPUT_FILE" ]]; then
    echo "Error: file not found: $INPUT_FILE" >&2
    exit 1
  fi
  echo "Using file: $INPUT_FILE"
  ffmpeg -y -i "$INPUT_FILE" -ar 16000 -ac 1 "$TMPFILE" -loglevel error
else
  # Live recording
  echo ""
  echo "Speak your feature idea. Press Ctrl+C when done."
  echo ""

  # Try PulseAudio first, then ALSA, then error with helpful message
  if ffmpeg -y -f pulse -i default -ar 16000 -ac 1 "$TMPFILE" -loglevel error 2>/dev/null; then
    : # success
  elif ffmpeg -y -f alsa -i default -ar 16000 -ac 1 "$TMPFILE" -loglevel error 2>/dev/null; then
    : # success
  else
    echo "" >&2
    echo "Live recording not available (no audio input detected in WSL2)." >&2
    echo "" >&2
    echo "To use voice input, record on your phone or another tool, then run:" >&2
    echo "  make voice FILE=path/to/recording.m4a" >&2
    exit 1
  fi
fi

# ── Transcribe via OpenAI Whisper ─────────────────────────────────────────────
echo ""
echo "Transcribing..."

TRANSCRIPT=$(curl -s https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F model="whisper-1" \
  -F file="@$TMPFILE" \
  | jq -r '.text')

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

# ── Start spec session with transcription pre-loaded ─────────────────────────
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
