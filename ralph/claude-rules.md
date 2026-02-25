# Ralph Wiggum Workflow

Each agent session starts with fresh context. Progress persists through CODE ON DISK and GIT COMMITS, not conversation history.

## On Session Start

Before doing anything:

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

- Read active task folders: plan.md, updates.md, user_story.json (if present)
- If a verification command exists in plan.md, run it to see current state
- Do NOT rely on prior conversation context

## Do ONE Atomic Unit of Work

1. Read plan.md (and user_story.json if present) to find what to do
2. Make ONE change (one file or one story)
3. Commit immediately
4. Run verification if defined (grep, tsc, npm run build, ./ralph/verify-*.sh, etc.)
5. Update updates.md with what you did

Do NOT try to complete an entire multi-step task in one session.

## Never Self-Assess as Done

External verification decides completion:
- grep commands checking for remaining patterns
- Type checkers (tsc --noEmit, dart analyze)
- Test runners (pytest, npm test, flutter test)
- Build commands
- Custom verification scripts

## Update Working Memory

After progress, update the task's updates.md with timestamp and what was done.

## If No Active Task

If docs/working-memory/open/ is empty: report what you found, ask for direction, do NOT invent work.

---

# Git Discipline

Every agent, every iteration, every session. No exceptions.

## Commit Rules

1. **Commit after every atomic change** — one file = one commit; tightly coupled changes = one commit
2. **Conventional prefixes** — feat: fix: refactor: test: docs: chore:
3. **Pre-work check** — run `git status` and `git log --oneline -5` before starting
4. **Post-commit verify** — run `git status` to confirm clean tree
5. **Never end a session with uncommitted work**

## Forbidden

- Never force push or skip hooks
- Never amend pushed commits
- Never hard reset without explicit user request
- Never commit .env or secrets

## Trunk-Based Development

All commits go directly to master. Short-lived branches (< 1 day) only for PRs or spikes.

## Why This Matters

In Ralph, each agent iteration starts fresh. The ONLY way progress persists is through git commits. If you don't commit, the next iteration loses your work.
