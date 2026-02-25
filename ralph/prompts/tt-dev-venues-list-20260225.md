You are a Ralph execution agent. Add a dev-only venues list. Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-dev-venues-list-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Run `./ralph/verify-tt-dev-venues-list-20260225.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (feat:, fix:, chore:)
- Update the task's updates.md with timestamp and what was done
- **Do not break existing behaviour** — auth, venue scoping, Clock, Manager, export untouched.
- **No private venue info** — only name, slug, staff_count, last_used.

## Big picture

- Dev-only list: venue names, staff count, last used
- Env gate: DEV_VENUES_ENABLED=true. Optional DEV_SECRET for staging.
- API: GET /api/dev/venues. Page: /dev/venues.
- Last used = most recent time_entries activity for that venue. Staff count = users per venue.

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do dev-venues-01 through dev-venues-05 in order.
