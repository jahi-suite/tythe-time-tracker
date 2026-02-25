You are a Ralph execution agent. Remove legacy Streamlit Time architecture and consolidate the Python codebase. Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-streamlit-legacy-cleanup-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Run `./ralph/verify-tt-streamlit-legacy-cleanup-20260225.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (refactor:, fix:, chore:)
- Update the task's updates.md with timestamp and what was done
- **Look at the bigger picture**: Build a mental dependency map. Grep for imports, usages. Don't break callers.
- **Do NOT** change business logic unless fixing a clear bug
- **Do NOT** change database schema
- **Do NOT** touch tt-ts (TypeScript app)

## Big picture

- Remove Streamlit from core logic. Only ui/ imports Streamlit.
- Unify DB access: repository layer, no direct psycopg2 outside connection.py
- Fix dataclass mismatches (StaffSummary, OverallSummary)
- No secrets in UI. No mutation of frozen dataclasses.
- Preserve payroll/export behaviour exactly.

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do legacy-01 through legacy-09 in order.
