#!/usr/bin/env bash
# Ralph shared library: configurable agent backend (Claude, Cursor, Codex, or OpenAI Codex CLI).
# Source this from run.sh.
# Usage: spawn_agent <repo_root> <prompt_content>
# Environment: RALPH_BACKEND (claude|cursor|codex|codex-cli), RALPH_MODEL (Cursor/Codex), RALPH_CLAUDE_MODEL (Claude)

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

# Resolve OpenAI Codex CLI (PATH or RALPH_CODEX_CLI_CMD).
find_codex_cli() {
  if [ -n "${RALPH_CODEX_CLI_CMD:-}" ] && [ -x "$RALPH_CODEX_CLI_CMD" ]; then
    echo "$RALPH_CODEX_CLI_CMD"
    return
  fi
  if command -v codex &>/dev/null; then
    echo "codex"
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
  elif [ "${RALPH_BACKEND:-claude}" = "codex-cli" ]; then
    local codex_bin
    codex_bin=$(find_codex_cli)
    if [ -z "$codex_bin" ]; then
      echo -e "\033[1;31m[FAIL]\033[0m Codex CLI not found. Install with: npm i -g @openai/codex" >&2
      echo "  If already installed, ensure codex is on PATH or set RALPH_CODEX_CLI_CMD to the full path." >&2
      return 1
    fi
    (
      cd "$repo_root" && "$codex_bin" exec -C "$repo_root" --full-auto ${RALPH_CODEX_CLI_MODEL:+--model "$RALPH_CODEX_CLI_MODEL"} "$prompt_content"
    ) || true
  else
    local -a cmd=(cursor agent --print --force --workspace "$repo_root")
    local model="${RALPH_MODEL:-}"
    [ "${RALPH_BACKEND:-claude}" = "codex" ] && model="${model:-gpt-5.3-codex-fast}"
    [ -n "$model" ] && cmd+=(--model "$model")
    "${cmd[@]}" "$prompt_content" || true
  fi
}
