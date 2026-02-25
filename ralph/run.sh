#!/usr/bin/env bash
set -uo pipefail

# ralph/run.sh — Universal Ralph loop runner.
#
# Runs the Cursor CLI in a loop, spawning fresh agents until all stories pass.
# Requires: plan.md, user_story.json, updates.md. No plan-only mode.
#
# Usage:
#   ./ralph/run.sh <task-id>                   # run the loop
#   ./ralph/run.sh <task-id> --status          # show progress
#   ./ralph/run.sh <task-id> --once            # one iteration only
#   ./ralph/run.sh <task-id> --dry-run         # show what would run
#
# Environment:
#   RALPH_BACKEND        Agent backend: claude (default), cursor, codex, codex-cli, or gemini
#   RALPH_MODEL          Cursor model when backend=cursor (e.g. grok)
#   RALPH_CLAUDE_MODEL   Claude model when backend=claude (e.g. sonnet, opus)
#   RALPH_GEMINI_MODEL   Gemini model when backend=gemini (e.g. gemini-2.5-pro, gemini-3-pro)
#   RALPH_MAX_ITERATIONS Max iterations (default: 30)
#   RALPH_SLEEP          Seconds between iterations (default: 3)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib.sh
. "$SCRIPT_DIR/lib.sh"

MODE=""
TASK_ID=""

for arg in "$@"; do
  case "$arg" in
    --status)   MODE="status" ;;
    --once)     MODE="once" ;;
    --dry-run)  MODE="dry-run" ;;
    --help|-h)
      echo "Usage: ./ralph/run.sh <task-id> [--status|--once|--dry-run]"
      exit 0
      ;;
    -*)
      echo "Unknown flag: $arg" >&2; exit 1
      ;;
    *)
      [ -z "$TASK_ID" ] && TASK_ID="$arg" || { echo "Too many arguments" >&2; exit 1; }
      ;;
  esac
done

if [ -z "$TASK_ID" ]; then
  echo "Tasks in open/ (runnable):"
  count=0
  for d in "$REPO_ROOT"/docs/working-memory/open/*/; do
    [ -d "$d" ] && echo "  $(basename "$d")" && count=$((count + 1))
  done
  [ $count -eq 0 ] && echo "  (none — add new tasks to docs/working-memory/open/ with plan.md + user_story.json)"
  echo ""
  echo "Usage: ./ralph/run.sh <task-id>" >&2
  exit 1
fi

TASK_DIR="docs/working-memory/open/$TASK_ID"
ABS_TASK_DIR="$REPO_ROOT/$TASK_DIR"

if [ ! -d "$ABS_TASK_DIR" ]; then
  echo "Task not found: $TASK_DIR" >&2
  echo "Run ./ralph/new.sh to create one, or check docs/working-memory/open/" >&2
  exit 1
fi

MAX_ITERATIONS="${RALPH_MAX_ITERATIONS:-30}"
SLEEP_BETWEEN="${RALPH_SLEEP:-3}"
BACKEND="${RALPH_BACKEND:-claude}"
MODEL="${RALPH_MODEL:-grok}"
CLAUDE_MODEL="${RALPH_CLAUDE_MODEL:-}"

info()  { echo -e "\033[1;34m[INFO]\033[0m $*"; }
ok()    { echo -e "\033[1;32m[ OK ]\033[0m $*"; }
warn()  { echo -e "\033[1;33m[WARN]\033[0m $*"; }
fail()  { echo -e "\033[1;31m[FAIL]\033[0m $*"; }

PROMPT_FILE="$REPO_ROOT/ralph/prompts/${TASK_ID}.md"
STORIES_FILE="$ABS_TASK_DIR/user_story.json"

if [ ! -f "$STORIES_FILE" ]; then
  fail "Task must have user_story.json. No plan-only mode. See ralph/TASK-STRUCTURE.md"
  exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
  PROMPT_FILE=$(ls "$REPO_ROOT"/ralph/prompts/*"${TASK_ID}"* 2>/dev/null | head -1 || true)
  [ -z "$PROMPT_FILE" ] || [ ! -f "$PROMPT_FILE" ] && PROMPT_FILE="$REPO_ROOT/ralph/prompts/_template.md"
  if [ ! -f "$PROMPT_FILE" ]; then
    fail "No prompt found. Create ralph/prompts/${TASK_ID}.md or use _template.md"
    exit 1
  fi
fi

# ── Story-based helpers ──────────────────────────────────────
remaining_stories() {
  python3 -c "
import json
d = json.load(open('$STORIES_FILE'))
print(len([s for s in d['stories'] if not s['passes']]))
"
}

next_story() {
  python3 -c "
import json
d = json.load(open('$STORIES_FILE'))
for s in d['stories']:
    if not s['passes']:
        print(s['id'])
        break
"
}

story_status() {
  python3 -c "
import json
d = json.load(open('$STORIES_FILE'))
total = len(d['stories'])
done = len([s for s in d['stories'] if s['passes']])
print(f'{done}/{total} stories complete')
for s in d['stories']:
    mark = '\033[32m+\033[0m' if s['passes'] else '\033[31m-\033[0m'
    print(f'  {mark} {s[\"id\"]}: {s[\"title\"]}')
"
}

# ── Status mode ──────────────────────────────────────────────
if [ "$MODE" = "status" ]; then
  info "Task: $TASK_ID"
  story_status
  exit 0
fi

# ── Spawn agent ──────────────────────────────────────────────
spawn() {
  local prompt_content="$1"
  spawn_agent "$REPO_ROOT" "$prompt_content" || warn "Agent exited non-zero (may have made progress)"
}

# ── Main loop ────────────────────────────────────────────────
info "Ralph loop: $TASK_ID | backend: $BACKEND | max: $MAX_ITERATIONS"

ITERATION=0
LAST_STORY=""
RETRY=0
MAX_RETRIES=3

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))

  # Task may have been moved to done/ by agent; treat as complete
  if [ ! -d "$ABS_TASK_DIR" ]; then
    if [ -d "$REPO_ROOT/docs/working-memory/done/$TASK_ID" ]; then
      ok "Task completed (moved to done/)"
      exit 0
    fi
    fail "Task folder disappeared: $TASK_DIR"
    exit 1
  fi

  REMAINING=$(remaining_stories)
  if [ "$REMAINING" -eq 0 ]; then
    ok "All stories complete!"
    exit 0
  fi

  TARGET=$(next_story)
  if [ "$TARGET" = "$LAST_STORY" ]; then
    RETRY=$((RETRY + 1))
    [ $RETRY -ge $MAX_RETRIES ] && { fail "$TARGET failed after $MAX_RETRIES retries"; exit 1; }
    warn "Retrying $TARGET (attempt $((RETRY + 1))/$MAX_RETRIES)"
  else
    RETRY=0
    LAST_STORY="$TARGET"
  fi

  info "[$ITERATION/$MAX_ITERATIONS] Story: $TARGET ($REMAINING remaining)"

  if [ "$MODE" = "dry-run" ]; then
    echo "  Would run: $TARGET"
    exit 0
  fi

  PROMPT=$(sed "s|{{STORY_ID}}|${TARGET}|g; s|{{TASK_ID}}|${TASK_ID}|g; s|{{TASK_DIR}}|${TASK_DIR}|g" "$PROMPT_FILE")
  spawn "$PROMPT"

  [ "$MODE" = "once" ] && { info "Single iteration (--once): done"; exit 0; }
  sleep "$SLEEP_BETWEEN"
done

fail "Reached max iterations ($MAX_ITERATIONS)"
exit 1
