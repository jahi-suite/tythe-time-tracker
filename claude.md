# Claude with Ralph

Ralph loops can use **Claude** (Claude Code CLI) or **Cursor** as the agent backend. **Claude is the default.**

## Install Claude CLI

From the project root:

```bash
./ralph/install-claude.sh
```

Or install manually (macOS, Linux, WSL):

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Then confirm (Ralph also checks `~/.local/bin/claude` if `claude` isn’t in PATH):

```bash
claude -v
# If not found, add to ~/.zshrc: export PATH="$HOME/.local/bin:$PATH"
# then: source ~/.zshrc
```

You may need to run `claude` once and sign in or set `ANTHROPIC_API_KEY`.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `RALPH_BACKEND` | `claude` | Agent backend: `claude` or `cursor` |
| `RALPH_CLAUDE_MODEL` | (none) | Claude model alias: `sonnet`, `opus`, `haiku`. Omit for Claude’s default. |
| `RALPH_MODEL` | `grok` | Used only when `RALPH_BACKEND=cursor` (Cursor model). |
| `RALPH_MAX_ITERATIONS` | `30` | Max loop iterations. |
| `RALPH_SLEEP` | `3` | Seconds between iterations. |

### Examples

```bash
# Use Claude (default), Claude picks model
./ralph/run.sh tt-user-auth-20260222

# Use Claude with a specific model
RALPH_CLAUDE_MODEL=sonnet ./ralph/run.sh tt-user-auth-20260222

# Use Cursor instead
RALPH_BACKEND=cursor ./ralph/run.sh tt-user-auth-20260222
```

## Rules for Claude

Claude receives the same workflow and git rules as Cursor via an appended system prompt. The content lives in:

- **`ralph/claude-rules.md`** — Ralph Wiggum workflow + git discipline (migrated from `.cursor/rules/`).

That file is passed to the Claude CLI as `--append-system-prompt-file`, so every Ralph-spawned Claude session follows:

1. **Ralph workflow** — Orient with `git log`, `git status`, read `plan.md` and `user_story.json`; do one atomic unit of work; commit; update `updates.md`; never self-assess as done.
2. **Git discipline** — Commit after every atomic change; conventional prefixes (`feat:`, `fix:`, etc.); no force push, no `.env` in git; trunk-based development.

These match the Cursor rules in `.cursor/rules/ralph-workflow.mdc` and `.cursor/rules/git-discipline.mdc`.

## Unattended / CI

For non-interactive runs (e.g. CI), Claude may prompt for permissions. You can use:

```bash
claude -p --permission-mode plan "your prompt"
```

Ralph does not set permission mode by default; add it in `ralph/lib.sh` if you need it (e.g. `--dangerously-skip-permissions` or `--permission-mode plan`).
