You are a Ralph execution agent. Add per-venue supervisor settings. Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-venue-supervisor-settings-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Run `./ralph/verify-tt-venue-supervisor-settings-20260225.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (feat:, fix:, chore:)
- Update the task's updates.md with timestamp and what was done
- **Do not break existing behaviour** — defaults must match current. Tythe unchanged.
- **Get settings onto the UI** — VenueSettingsPage must have the supervisor fieldset and it must work.

## Big picture

- Add supervisor_enabled, supervisor_label, supervisor_deduct_break to venue settings
- Migration, API, VenueSettingsPage (UI early), exportUtils, Clock, Manager, export
- Clients need to read settings: add GET /api/venues/current/settings (auth required) or include in /me
- Backward compat: all defaults = current behaviour
- **Before each change**: What does this touch? Clock? Manager? Export? Auth? Don't break existing flows.

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do supervisor-01 through supervisor-09 in order.
