#!/usr/bin/env bash
# voice-to-spec.sh — record via mic, transcribe via Whisper, start spec session
#
# Transcription (in order of preference):
#   1. Local whisper CLI   — no API key needed: pip install openai-whisper
#   2. OpenAI Whisper API  — set OPENAI_API_KEY in .env or shell
#
# Usage:
#   ./scripts/voice-to-spec.sh              # live mic recording
#   ./scripts/voice-to-spec.sh idea.m4a     # use an existing audio file

set -euo pipefail

TMPWAV=$(mktemp /tmp/voice-XXXXXX.wav)
trap 'rm -f "$TMPWAV" "${TMPWAV%.wav}.txt"' EXIT

# ── Pick transcription method ─────────────────────────────────────────────────
if command -v whisper &>/dev/null; then
  TRANSCRIBE_METHOD="local"
else
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
  echo "Converting $INPUT_FILE..."
  ffmpeg -y -i "$INPUT_FILE" -ar 16000 -ac 1 "$TMPWAV" -loglevel error
else
  # Live recording via WSLg PulseAudio
  # PULSE_SERVER is set automatically by WSLg: unix:/mnt/wslg/PulseServer
  if [[ -z "${PULSE_SERVER:-}" ]] && [[ -S "/mnt/wslg/PulseServer" ]]; then
    export PULSE_SERVER="unix:/mnt/wslg/PulseServer"
  fi

  echo ""
  echo "  Listening... press Enter to stop."
  echo ""

  # Record in background, stop when user presses Enter
  ffmpeg -y -f pulse -i default -ar 16000 -ac 1 "$TMPWAV" -loglevel error &
  FFMPEG_PID=$!

  read -r -s   # wait for Enter
  kill -INT "$FFMPEG_PID" 2>/dev/null || true
  wait "$FFMPEG_PID" 2>/dev/null || true

  if [[ ! -s "$TMPWAV" ]]; then
    echo "" >&2
    echo "Error: no audio captured." >&2
    echo "If your mic isn't working, try: make voice FILE=path/to/recording.m4a" >&2
    exit 1
  fi
fi

# ── Transcribe ────────────────────────────────────────────────────────────────
echo "  Transcribing..."

if [[ "$TRANSCRIBE_METHOD" == "local" ]]; then
  whisper "$TMPWAV" --model small --output_format txt \
    --output_dir /tmp --verbose False 2>/dev/null
  TRANSCRIPT=$(cat "${TMPWAV%.wav}.txt" 2>/dev/null | tr -d '\n' | xargs)
else
  TRANSCRIPT=$(curl -s https://api.openai.com/v1/audio/transcriptions \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F model="whisper-1" \
    -F file="@$TMPWAV" \
    | jq -r '.text')
fi

if [[ -z "$TRANSCRIPT" ]] || [[ "$TRANSCRIPT" == "null" ]]; then
  echo "Error: transcription failed or returned empty." >&2
  exit 1
fi

echo ""
echo "  ────────────────────────────────"
echo "  $TRANSCRIPT"
echo "  ────────────────────────────────"
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
