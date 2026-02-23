#!/usr/bin/env bash
set -uo pipefail

# Ralph loop for: tt-ts-shifts-payrates-20260223
# Easier shift edit/delete + pay rates editing

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
. "$REPO_ROOT/ralph/lib.sh"

TASK_ID="tt-ts-shifts-payrates-20260223"
TASK_DIR="docs/working-memory/open/$TASK_ID"
PROMPT_FILE="$REPO_ROOT/ralph/prompts/$TASK_ID.md"

export RALPH_BACKEND="${RALPH_BACKEND:-codex-cli}"
MAX_ITERATIONS="${RALPH_MAX_ITERATIONS:-8}"
SLEEP="${RALPH_SLEEP:-3}"

verify() {
  "$REPO_ROOT/ralph/verify-tt-ts-shifts-payrates.sh"
}

info()  { echo -e "\033[1;34m[INFO]\033[0m $*"; }
ok()    { echo -e "\033[1;32m[ OK ]\033[0m $*"; }
fail()  { echo -e "\033[1;31m[FAIL]\033[0m $*"; }

info "Ralph loop: $TASK_ID | backend: $RALPH_BACKEND | max: $MAX_ITERATIONS"
ITERATION=0
while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  if verify; then
    ok "Verification passed at iteration $ITERATION"
    exit 0
  fi
  PROMPT=$(sed "s|{{TASK_ID}}|$TASK_ID|g; s|{{TASK_DIR}}|$TASK_DIR|g" "$PROMPT_FILE")
  info "[$ITERATION/$MAX_ITERATIONS] Spawning agent..."
  spawn_agent "$REPO_ROOT" "$PROMPT" || true
  sleep "$SLEEP"
done
fail "Max iterations ($MAX_ITERATIONS) reached"
exit 1
