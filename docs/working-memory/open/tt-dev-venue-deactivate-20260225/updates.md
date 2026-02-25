# tt-dev-venue-deactivate-20260225 — Updates

> Ralph implements one story per iteration. Log progress here.

## Progress

- 2026-02-25: Task created. Ralph to implement.
- 2026-02-25T16:03:45+00:00: Completed `deactivate-01` by adding migration support for `venues.active` (default `TRUE`) for new installs and existing databases via `ensureVenueActiveColumn`, with null backfill safety. Verified build and migration check pass.
- 2026-02-25T16:05:49+00:00: Completed `deactivate-02` by filtering inactive venues from auth venue resolution (`getVenueBySlug`, `getVenueById`) and `/api/venues/search`, which also makes public `/api/venues/:slug` lookup return 404 for inactive venues. Verified task script now passes auth-filter checks.
