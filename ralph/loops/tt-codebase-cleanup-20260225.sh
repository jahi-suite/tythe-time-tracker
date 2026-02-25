#!/usr/bin/env bash
set -uo pipefail

# Ralph loop for: tt-codebase-cleanup-20260225
# Codebase cleanup — archive stale tasks, remove orphans, fix broken state

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
. "$REPO_ROOT/ralph/lib.sh"

TASK_ID="tt-codebase-cleanup-20260225"
TASK_DIR="docs/working-memory/open/$TASK_ID"
PROMPT_FILE="$REPO_ROOT/ralph/prompts/$TASK_ID.md"

export RALPH_BACKEND="${RALPH_BACKEND:-codex-cli}"
MAX_ITERATIONS="${RALPH_MAX_ITERATIONS:-20}"
SLEEP="${RALPH_SLEEP:-3}"

verify() {
  "$REPO_ROOT/ralph/verify-tt-codebase-cleanup-20260225.sh"
}

info()  { echo -e "\033[1;34m[INFO]\033[0m $*"; }
ok()    { echo -e "\033[1;32m[ OK ]\033[0m $*"; }
fail()  { echo -e "\033[1;31m[FAIL]\033[0m $*"; }

info "Ralph loop: $TASK_ID | backend: $RALPH_BACKEND | max: $MAX_ITERATIONS"
info "Cleaning up codebase..."
ITERATION=0
while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  VERIFY_OUTPUT=$(verify 2>&1) || true
  if echo "$VERIFY_OUTPUT" | grep -qE 'passed, 0 failed'; then
    ok "Codebase cleanup complete at iteration $ITERATION"
    exit 0
  fi
  # Inject verify output so Ralph sees actual failures
  PROMPT=$(sed "s|{{TASK_ID}}|$TASK_ID|g; s|{{TASK_DIR}}|$TASK_DIR|g" "$PROMPT_FILE")
  PROMPT="$PROMPT

---
**Verify output (current state):**
\`\`\`
$VERIFY_OUTPUT
\`\`\`
Address the FAIL lines above. Do ONE story per iteration.
"
  info "[$ITERATION/$MAX_ITERATIONS] Spawning agent..."
  spawn_agent "$REPO_ROOT" "$PROMPT" || true
  sleep "$SLEEP"
done
fail "Max iterations ($MAX_ITERATIONS) reached"
exit 1
