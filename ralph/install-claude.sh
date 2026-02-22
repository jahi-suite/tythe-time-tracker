#!/usr/bin/env bash
set -euo pipefail

# Install Claude Code CLI (official install script).
# See https://docs.anthropic.com/en/docs/claude-code/quickstart

echo "Installing Claude Code CLI..."
curl -fsSL https://claude.ai/install.sh | bash

echo ""
echo "Install complete. Claude is typically installed to ~/.local/bin/claude"
echo "Add to PATH if needed (e.g. in ~/.zshrc):"
echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
echo "Then run: claude -v"
echo "On first run you may need to sign in or set ANTHROPIC_API_KEY."
echo "Ralph will also look for ~/.local/bin/claude automatically if claude is not in PATH."
echo "See claude.md in the project root for Ralph configuration."
