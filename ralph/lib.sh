#!/usr/bin/env bash
# Ralph shared library: configurable agent backend (Claude, Cursor, Codex, Codex CLI, or Gemini).
# Source this from run.sh.
# Usage: spawn_agent <repo_root> <prompt_content>
# Environment: RALPH_BACKEND (gemini default|claude|cursor|codex|codex-cli), RALPH_MODEL (Cursor/Codex), RALPH_CLAUDE_MODEL (Claude), RALPH_GEMINI_MODEL (default: gemini-2.0-flash, free tier)

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

# Resolve Google Gemini CLI (PATH, npx, or RALPH_GEMINI_CMD).
find_gemini_cli() {
  if [ -n "${RALPH_GEMINI_CMD:-}" ] && [ -x "$RALPH_GEMINI_CMD" ]; then
    echo "$RALPH_GEMINI_CMD"
    return
  fi
  if command -v gemini &>/dev/null; then
    echo "gemini"
    return
  fi
  if command -v npx &>/dev/null; then
    echo "npx"
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

  if [ "${RALPH_BACKEND:-gemini}" = "claude" ]; then
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
  elif [ "${RALPH_BACKEND:-gemini}" = "codex-cli" ]; then
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
  elif [ "${RALPH_BACKEND:-gemini}" = "gemini" ]; then
    # Gemini CLI requires Node 20+; ensure nvm is loaded if available
    if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
      # shellcheck source=/dev/null
      . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
      nvm use default 2>/dev/null || nvm use 20 2>/dev/null || true
    fi
    local gemini_bin
    gemini_bin=$(find_gemini_cli)
    if [ -z "$gemini_bin" ]; then
      echo -e "\033[1;31m[FAIL]\033[0m Gemini CLI not found. Install with: npm i -g @google/gemini-cli" >&2
      echo "  Or run: npx @google/gemini-cli -p 'test'" >&2
      echo "  Set RALPH_GEMINI_CMD to full path if installed elsewhere." >&2
      return 1
    fi
    local gemini_cmd
    if [ "$gemini_bin" = "npx" ]; then
      gemini_cmd="npx -y @google/gemini-cli"
    else
      gemini_cmd="$gemini_bin"
    fi
    # Prefer OAuth (gemini login) over API key. If user logged in with `gemini` CLI, use that.
    if [ -f "${HOME}/.gemini/oauth_creds.json" ]; then
      unset GEMINI_API_KEY
    elif [ -z "${GEMINI_API_KEY:-}" ] && [ -f "${HOME}/.gemini/.env" ]; then
      # shellcheck source=/dev/null
      set -a && . "${HOME}/.gemini/.env" && set +a
    fi
    (
      cd "$repo_root" && printf '%s' "$prompt_content" | $gemini_cmd --yolo \
        --model "${RALPH_GEMINI_MODEL:-gemini-2.0-flash}"
    ) || true
  else
    local -a cmd=(cursor agent --print --force --workspace "$repo_root")
    local model="${RALPH_MODEL:-}"
    [ "${RALPH_BACKEND:-gemini}" = "codex" ] && model="${model:-gpt-5.3-codex-fast}"
    [ -n "$model" ] && cmd+=(--model "$model")
    "${cmd[@]}" "$prompt_content" || true
  fi
}
