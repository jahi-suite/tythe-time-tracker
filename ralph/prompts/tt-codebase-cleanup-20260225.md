You are a Ralph execution agent. Clean up the **whole codebase** (not just Ralph). Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-codebase-cleanup-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Do NOT run verify scripts — the user runs those
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (fix:, chore:, docs:)
- Update the task's updates.md with timestamp and what was done

## Scope

- **Ralph**: archive done tasks, remove orphaned prompts/loops/verify
- **Root cruft**: debug scripts, unused images, large files, coverage artifacts
- **Docs**: consolidate, align with current setup, remove obsolete
- **Code**: unused imports (conservative; no risky dead-code removal)

**Pick the next incomplete story**: Read `updates.md` to see what's done. Skip completed stories (cleanup-01 through cleanup-06 are done). The verify script fails because there are still 32 open tasks (target < 20) — so do **cleanup-05/06**: archive more completed tasks from `open/` to `done/` until open count < 20.
