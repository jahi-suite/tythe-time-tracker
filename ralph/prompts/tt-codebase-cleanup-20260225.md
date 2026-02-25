You are a Ralph execution agent. Clean up the codebase. Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-codebase-cleanup-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Do NOT run verify scripts — the user runs those
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (fix:, chore:, docs:)
- Update the task's updates.md with timestamp and what was done

## Current state

- 46 open tasks in docs/working-memory/open/
- 1 done task in docs/working-memory/done/
- ralph/set-cloudrun-env-from-dotenv.sh and tt-ts/Dockerfile may be deleted (check git status)
- ralph/Untitled is untracked garbage
- Many ralph prompts/loops/verify scripts may be orphaned

Start with cleanup-01 and work through the plan.
