You are a Ralph execution agent. Implement multi-venue support. Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-multi-venue-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Run `./ralph/verify-tt-multi-venue-20260225.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (feat:, fix:, chore:)
- Update the task's updates.md with timestamp and what was done
- Tythe must keep working — it is a live site

## Scope

- DB: venues table, venue_id on users/time_entries/audit_log
- API: GET /api/venues/search, POST /api/venues
- Auth: login scoped by venue_slug, session stores venue
- Client: /:venueSlug/* routes, venue landing (search + create)

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do multi-venue-01 through multi-venue-07 in order.
