#!/usr/bin/env bash
# Ralph shared library: configurable agent backend (Claude or Cursor).
# Source this from run.sh and from loops/*.sh.
# Usage: spawn_agent <repo_root> <prompt_content>
# Environment: RALPH_BACKEND (claude|cursor), RALPH_MODEL (Cursor), RALPH_CLAUDE_MODEL (Claude)

# Resolve Claude CLI binary (PATH, common install path, or RALPH_CLAUDE_CMD).
find_claude() {
  if [ -n "${RALPH_CLAUDE_CMD:-}" ] && [ -x "$RALPH_CLAUDE_CMD" ]; then
    echo "$RALPH_CLAUDE_CMD"
    return
  fi
  if command -v claude &>/dev/null; then
    echo "claude"
    return
  fi
  if [ -x "${HOME:-/home/$USER}/.local/bin/claude" ]; then
    echo "${HOME:-/home/$USER}/.local/bin/claude"
    return
  fi
  echo ""
}

spawn_agent() {
  local repo_root="$1"
  local prompt_content="$2"

  if [ "${RALPH_BACKEND:-claude}" = "claude" ]; then
    local claude_bin
    claude_bin=$(find_claude)
    if [ -z "$claude_bin" ]; then
      echo -e "\033[1;31m[FAIL]\033[0m Claude CLI not found. Install with: ./ralph/install-claude.sh" >&2
      echo "  If already installed, add ~/.local/bin to PATH or set RALPH_CLAUDE_CMD to the full path." >&2
      return 1
    fi
    (
      cd "$repo_root" && "$claude_bin" -p --dangerously-skip-permissions --no-session-persistence \
        --append-system-prompt-file "$repo_root/ralph/claude-rules.md" \
        ${RALPH_CLAUDE_MODEL:+--model "$RALPH_CLAUDE_MODEL"} \
        "$prompt_content"
    ) || true
  else
    local -a cmd=(cursor agent --print --force --workspace "$repo_root")
    [ -n "${RALPH_MODEL:-}" ] && cmd+=(--model "$RALPH_MODEL")
    "${cmd[@]}" "$prompt_content" || true
  fi
}
