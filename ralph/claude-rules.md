# Ralph Wiggum Workflow

Each agent session starts with fresh context. Progress persists through CODE ON DISK and GIT COMMITS, not conversation history.

## Canonical Task Structure (One Way Only)

Every task has exactly three artifacts:

- **plan.md** — PRD/context: what and why, affected files, verification command
- **user_story.json** — Small user stories with acceptance criteria; each story has `id`, `title`, `acceptance_criteria`, `passes`
- **updates.md** — Progress log and failure notes

There is no plan-only mode. All tasks use user_story.json.

## On Session Start

Before doing anything:

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

- Read active task folder: plan.md, updates.md, user_story.json
- If a verification command exists in plan.md, run it to see current state
- Do NOT rely on prior conversation context

## Do ONE Atomic Unit of Work

1. Read plan.md and user_story.json to find the next unpassed story
2. Implement that story per its acceptance criteria (one atomic change)
3. Commit immediately
4. Run verification if defined (grep, npm run build, tsc, etc.)
5. Update updates.md:
   - **If criteria met:** what you did; set `passes: true` for that story
   - **If criteria not met:** what you tried, what worked, what didn't, what to try next (feeds the retry loop)

Do NOT try to complete an entire multi-step task in one session.

## Never Self-Assess as Done

External verification decides completion:
- grep commands checking for remaining patterns
- Type checkers (tsc --noEmit, dart analyze)
- Test runners (pytest, npm test, flutter test)
- Build commands
- Custom verification scripts

## Failure → Retry Loop

When a story does not pass: record in updates.md what you tried, what worked, what didn't. The next iteration reads this and tries again with that context. Do not leave failed attempts undocumented.

## When All Stories Pass — Move to Done

When every story has `passes: true`, move the task folder from `docs/working-memory/open/<task-id>/` to `docs/working-memory/done/<task-id>/`, commit, and stop.

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
