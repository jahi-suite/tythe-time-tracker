#!/usr/bin/env bash
# loop.sh — canonical Ralph Wiggum loop for tythe-time-tracker
#
# Usage:
#   ./loop.sh              # build mode, runs until interrupted
#   ./loop.sh plan         # plan mode, runs until interrupted
#   ./loop.sh [N]          # build mode, N iterations
#   ./loop.sh plan [N]     # plan mode, N iterations

set -euo pipefail

MODE="build"
MAX_ITERATIONS=""

# Parse arguments
if [[ "${1:-}" == "plan" ]]; then
  MODE="plan"
  shift
fi
if [[ -n "${1:-}" ]] && [[ "$1" =~ ^[0-9]+$ ]]; then
  MAX_ITERATIONS="$1"
fi

if [[ "$MODE" == "plan" ]]; then
  PROMPT_FILE="PROMPT_plan.md"
else
  PROMPT_FILE="PROMPT_build.md"
fi

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Error: $PROMPT_FILE not found" >&2
  exit 1
fi

CLAUDE_BIN="claude"
if ! command -v claude &>/dev/null; then
  if [[ -x "$HOME/.local/bin/claude" ]]; then
    CLAUDE_BIN="$HOME/.local/bin/claude"
  else
    echo "Error: claude CLI not found. Run: scripts/install-claude.sh" >&2
    exit 1
  fi
fi

ITERATION=0
echo "Starting loop.sh in $MODE mode${MAX_ITERATIONS:+ (max $MAX_ITERATIONS iterations)}"

while true; do
  ITERATION=$((ITERATION + 1))
  echo ""
  echo "=== Iteration $ITERATION ==="

  cat "$PROMPT_FILE" | "$CLAUDE_BIN" -p --dangerously-skip-permissions --model opus

  if [[ -n "$MAX_ITERATIONS" ]] && [[ "$ITERATION" -ge "$MAX_ITERATIONS" ]]; then
    echo ""
    echo "Reached max iterations ($MAX_ITERATIONS). Stopping."
    break
  fi
done
