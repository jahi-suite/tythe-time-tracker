#!/usr/bin/env bash
set -uo pipefail

# Ralph loop for: tt-ui-polish-20260223
# Corporate, professional, trustworthy UI polish

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
. "$REPO_ROOT/ralph/lib.sh"

TASK_ID="tt-ui-polish-20260223"
TASK_DIR="docs/working-memory/open/$TASK_ID"
PROMPT_FILE="$REPO_ROOT/ralph/prompts/$TASK_ID.md"
STORIES_FILE="$REPO_ROOT/$TASK_DIR/user_story.json"

MAX_ITERATIONS="${RALPH_MAX_ITERATIONS:-15}"
SLEEP="${RALPH_SLEEP:-3}"
BACKEND="${RALPH_BACKEND:-claude}"

next_story() {
  python3 -c "
import json
d = json.load(open('$STORIES_FILE'))
for s in d['stories']:
    if not s.get('passes'):
        print(s['id'])
        break
" 2>/dev/null || true
}

verify() {
  [ "$(python3 -c "import json; d=json.load(open('$STORIES_FILE')); print(len([s for s in d['stories'] if not s.get('passes')]))")" -eq 0 ]
}

info()  { echo -e "\033[1;34m[INFO]\033[0m $*"; }
ok()    { echo -e "\033[1;32m[ OK ]\033[0m $*"; }
fail()  { echo -e "\033[1;31m[FAIL]\033[0m $*"; }

info "Ralph loop: $TASK_ID | backend: $BACKEND | max: $MAX_ITERATIONS"

ITERATION=0
while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))

  if verify; then
    ok "Verification passed at iteration $ITERATION"
    exit 0
  fi

  TARGET=$(next_story)
  PROMPT=$(sed "s|{{STORY_ID}}|${TARGET}|g; s|{{TASK_ID}}|$TASK_ID|g; s|{{TASK_DIR}}|$TASK_DIR|g" "$PROMPT_FILE")
  info "[$ITERATION/$MAX_ITERATIONS] Story: $TARGET — Spawning agent..."
  spawn_agent "$REPO_ROOT" "$PROMPT" || true

  sleep "$SLEEP"
done

fail "Max iterations ($MAX_ITERATIONS) reached"
exit 1
