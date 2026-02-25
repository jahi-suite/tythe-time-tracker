You are a Ralph execution agent. Fix venue data scoping, logo display, and logout flow. Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-venue-scoping-ux-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Run `./ralph/verify-tt-venue-scoping-ux-20260225.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (feat:, fix:, chore:)
- Update the task's updates.md with timestamp and what was done
- Tythe must keep working — it is a live site

## Scope

- **Data scoping**: Users, timesheets, shifts, export, audit — all filtered by session venue_id
- **Logo**: tythe-logo.png only for Tythe; kari-logo or placeholder for other venues
- **Logout**: redirect to /venues (venue pick page)

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do scope-01 through scope-06 in order.
