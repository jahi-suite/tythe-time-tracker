#!/usr/bin/env bash
set -euo pipefail

# ralph/status.sh — Show status of all tasks or a specific one.
#
# Usage:
#   ./ralph/status.sh           # all tasks
#   ./ralph/status.sh <task-id> # specific task

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

B='\033[1m'
G='\033[0;32m'
Y='\033[1;33m'
R='\033[0;31m'
NC='\033[0m'

show_task() {
  local task_dir="$1"
  local task_id
  task_id="$(basename "$task_dir")"
  local stories="$task_dir/user_story.json"

  echo -e "${B}$task_id${NC}"

  if [ ! -f "$stories" ]; then
    echo -e "  ${R}Missing user_story.json — all tasks must use plan.md + user_story.json. See ralph/TASK-STRUCTURE.md${NC}"
  else
    python3 -c "
import json
d = json.load(open('$stories'))
total = len(d['stories'])
done = len([s for s in d['stories'] if s['passes']])
remaining = total - done
pct = int(done/total*100) if total > 0 else 0
print(f'  Stories: {done}/{total} ({pct}%) | Remaining: {remaining}')
for s in d['stories']:
    mark = '\033[32m+\033[0m' if s['passes'] else '\033[31m-\033[0m'
    print(f'    {mark} {s[\"id\"]}: {s[\"title\"]}')
"
  fi

  if [ -f "$task_dir/updates.md" ]; then
    local status_line
    status_line=$(grep -m1 '^\*\*' "$task_dir/updates.md" 2>/dev/null || echo "  (no status entry)")
    echo -e "  ${Y}Latest:${NC} $status_line"
  fi
  echo ""
}

TARGET="${1:-}"

if [ -n "$TARGET" ]; then
  TASK_DIR="$REPO_ROOT/docs/working-memory/open/$TARGET"
  if [ ! -d "$TASK_DIR" ]; then
    echo "Task not found: $TARGET" >&2
    exit 1
  fi
  show_task "$TASK_DIR"
else
  echo -e "${B}━━━ Open Tasks ━━━${NC}"
  echo ""
  FOUND=0
  for d in "$REPO_ROOT"/docs/working-memory/open/*/; do
    [ -d "$d" ] || continue
    [ "$(basename "$d")" = "*" ] && continue
    show_task "$d"
    FOUND=$((FOUND + 1))
  done
  [ $FOUND -eq 0 ] && echo "  No open tasks. Run ./ralph/new.sh to create one."

  DONE_COUNT=0
  for d in "$REPO_ROOT"/docs/working-memory/done/*/; do
    [ -d "$d" ] || continue
    [ "$(basename "$d")" = "*" ] && continue
    DONE_COUNT=$((DONE_COUNT + 1))
  done
  [ $DONE_COUNT -gt 0 ] && echo -e "${G}$DONE_COUNT completed task(s) in docs/working-memory/done/${NC}"
fi
