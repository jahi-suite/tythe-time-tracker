You are a Ralph execution agent. Add deactivate/reactivate venue to the Dev Venues page. Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-dev-venue-deactivate-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Run `./ralph/verify-tt-dev-venue-deactivate-20260225.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (feat:, fix:, chore:)
- Update the task's updates.md with timestamp and what was done
- **Do not break existing behaviour** — auth, venue search, login, Tythe must keep working.
- **Never allow deactivating Tythe** — slug `tythe` is protected.

## Big picture

- Soft delete: add `active` column to venues. Deactivate = active=false.
- Filter inactive from search and auth. Dev list shows all with status.
- Dev page: Deactivate button (with confirm), Reactivate for inactive. Tythe has no deactivate button.

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do deactivate-01 through deactivate-07 in order.
