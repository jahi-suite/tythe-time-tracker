#!/usr/bin/env bash
# Check which Ralph backends and models have tokens / work.
# Runs the same commands Ralph would use, with a minimal prompt and timeout.
#
# Usage: ./ralph/check-models.sh
#   RALPH_CHECK_TIMEOUT=20 ./ralph/check-models.sh   # shorter timeout (default 45s)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
. "$SCRIPT_DIR/lib.sh"

PROBE_PROMPT="Reply with exactly: OK"
TIMEOUT_SEC="${RALPH_CHECK_TIMEOUT:-45}"

ok()   { echo -e "\033[1;32m  OK\033[0m $*"; }
fail() { echo -e "\033[1;31m FAIL\033[0m $*"; }
skip() { echo -e "\033[1;33m SKIP\033[0m $*"; }
info() { echo -e "\033[1;34m[INFO]\033[0m $*"; }
log()  { echo -e "\033[0;36m[LOG]\033[0m $*"; }

run_with_timeout() {
  timeout "$TIMEOUT_SEC" "$@" 2>&1
}

# ── Claude ───────────────────────────────────────────────────
check_claude() {
  local claude_bin
  claude_bin=$(find_claude)
  if [ -z "$claude_bin" ]; then
    info "Claude: CLI not found"
    return
  fi
  info "Claude: testing models (CLI: $claude_bin)"
  for model in haiku sonnet opus; do
    log "Claude ($model): running probe (timeout ${TIMEOUT_SEC}s)..."
    export RALPH_CLAUDE_MODEL="$model"
    out=$(run_with_timeout bash -c "cd \"$REPO_ROOT\" && \"$claude_bin\" -p --dangerously-skip-permissions --no-session-persistence --model \"$model\" \"$PROBE_PROMPT\"" 2>&1) || true
    exit_code=$?
    log "Claude ($model): exit_code=$exit_code, output lines=$(echo "$out" | wc -l)"
    if echo "$out" | grep -qi "OK\|exactly.*OK"; then
      ok "claude ($model)"
    elif echo "$out" | grep -qi "rate limit\|exhausted\|quota\|no.*tokens\|insufficient"; then
      fail "claude ($model) — no tokens / rate limit"
      echo "$out" | tail -3 | sed 's/^/       /'
    elif echo "$out" | grep -qi "error\|failed\|invalid"; then
      fail "claude ($model) — $(echo "$out" | tail -1 | head -c 60)"
      echo "$out" | tail -3 | sed 's/^/       /'
    else
      fail "claude ($model) — no clear OK (timeout or other)"
      echo "$out" | tail -3 | sed 's/^/       /'
    fi
  done
  unset RALPH_CLAUDE_MODEL
}

# ── Gemini ───────────────────────────────────────────────────
check_gemini() {
  if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
    nvm use default 2>/dev/null || nvm use 20 2>/dev/null || true
  fi
  local gemini_bin
  gemini_bin=$(find_gemini_cli)
  if [ -z "$gemini_bin" ]; then
    info "Gemini: CLI not found (npm i -g @google/gemini-cli)"
    return
  fi
  local gemini_cmd
  [ "$gemini_bin" = "npx" ] && gemini_cmd="npx -y @google/gemini-cli" || gemini_cmd="$gemini_bin"
  if [ -f "${HOME}/.gemini/oauth_creds.json" ]; then
    unset GEMINI_API_KEY
  elif [ -z "${GEMINI_API_KEY:-}" ] && [ -f "${HOME}/.gemini/.env" ]; then
    set -a && . "${HOME}/.gemini/.env" && set +a
  fi
  info "Gemini: testing default model"
  log "Gemini: running probe (timeout ${TIMEOUT_SEC}s)..."
  out=$(run_with_timeout bash -c "printf '%s' \"$PROBE_PROMPT\" | $gemini_cmd --yolo --model \"\${RALPH_GEMINI_MODEL:-gemini-2.0-flash}\"" 2>&1) || true
  exit_code=$?
  log "Gemini: exit_code=$exit_code, output lines=$(echo "$out" | wc -l)"
  if echo "$out" | grep -qi "OK\|exactly.*OK"; then
    ok "gemini (default)"
  elif echo "$out" | grep -qi "rate limit\|quota\|exhausted\|429"; then
    fail "gemini — no tokens / rate limit"
    echo "$out" | tail -3 | sed 's/^/       /'
  elif echo "$out" | grep -qi "error\|failed\|not found"; then
    fail "gemini — $(echo "$out" | tail -1 | head -c 60)"
    echo "$out" | tail -3 | sed 's/^/       /'
  else
    fail "gemini — no clear OK (timeout or other)"
    echo "$out" | tail -3 | sed 's/^/       /'
  fi
}

# ── Cursor ───────────────────────────────────────────────────
check_cursor() {
  if ! command -v cursor &>/dev/null; then
    info "Cursor: cursor CLI not in PATH"
    return
  fi
  info "Cursor: testing (cursor agent)"
  log "Cursor: running probe (timeout ${TIMEOUT_SEC}s)..."
  out=$(run_with_timeout cursor agent --print --force --workspace "$REPO_ROOT" "$PROBE_PROMPT" 2>&1) || true
  log "Cursor: exit_code=$?, output lines=$(echo "$out" | wc -l)"
  if echo "$out" | grep -qi "OK\|exactly.*OK"; then
    ok "cursor (default)"
  elif echo "$out" | grep -qi "rate limit\|quota\|error"; then
    fail "cursor — $(echo "$out" | tail -1 | head -c 60)"
    echo "$out" | tail -3 | sed 's/^/       /'
  else
    fail "cursor — no clear OK (timeout or other)"
    echo "$out" | tail -3 | sed 's/^/       /'
  fi
}

# ── Codex CLI ─────────────────────────────────────────────────
check_codex_cli() {
  local codex_bin
  codex_bin=$(find_codex_cli)
  if [ -z "$codex_bin" ]; then
    info "Codex CLI: not found (npm i -g @openai/codex)"
    return
  fi
  info "Codex CLI: testing"
  log "Codex CLI: running probe (timeout ${TIMEOUT_SEC}s)..."
  out=$(run_with_timeout bash -c "cd \"$REPO_ROOT\" && \"$codex_bin\" exec -C \"$REPO_ROOT\" --full-auto \"$PROBE_PROMPT\"" 2>&1) || true
  log "Codex CLI: exit_code=$?, output lines=$(echo "$out" | wc -l)"
  if echo "$out" | grep -qi "OK\|exactly.*OK"; then
    ok "codex-cli"
  elif echo "$out" | grep -qi "rate limit\|quota\|error"; then
    fail "codex-cli — $(echo "$out" | tail -1 | head -c 60)"
    echo "$out" | tail -3 | sed 's/^/       /'
  else
    fail "codex-cli — no clear OK"
    echo "$out" | tail -3 | sed 's/^/       /'
  fi
}

# ── Main ─────────────────────────────────────────────────────
echo ""
echo "Ralph backend/model check (timeout ${TIMEOUT_SEC}s per probe, prompt: \"$PROBE_PROMPT\")"
echo ""

log "Starting checks at $(date '+%H:%M:%S')"
echo ""

check_claude
echo ""
check_gemini
echo ""
check_cursor
echo ""
check_codex_cli

echo ""
log "Finished at $(date '+%H:%M:%S')"
info "Done. Use RALPH_BACKEND=claude|gemini|cursor and RALPH_*_MODEL=... when running ./ralph/run.sh"
