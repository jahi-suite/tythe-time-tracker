# tt-dev-venue-deactivate-20260225 — Updates

> Ralph implements one story per iteration. Log progress here.

## Progress

- 2026-02-25: Task created. Ralph to implement.
- 2026-02-25T16:03:45+00:00: Completed `deactivate-01` by adding migration support for `venues.active` (default `TRUE`) for new installs and existing databases via `ensureVenueActiveColumn`, with null backfill safety. Verified build and migration check pass.
- 2026-02-25T16:05:49+00:00: Completed `deactivate-02` by filtering inactive venues from auth venue resolution (`getVenueBySlug`, `getVenueById`) and `/api/venues/search`, which also makes public `/api/venues/:slug` lookup return 404 for inactive venues. Verified task script now passes auth-filter checks.
- 2026-02-25T16:07:46+00:00: Completed `deactivate-03` by adding `POST /api/dev/venues/:slug/deactivate` behind dev guards, returning 404 for missing venues and 400 for protected slug `tythe`. Verified task script passes deactivate route and Tythe protection checks.
- 2026-02-25T16:09:27+00:00: Completed `deactivate-04` by adding `POST /api/dev/venues/:slug/reactivate` behind dev guards with slug validation, `active = true` update, and 404 handling for missing venues. Verified `tt-ts` server TypeScript build passes.
- 2026-02-25T16:11:15+00:00: Completed `deactivate-05` by including `active` in `GET /api/dev/venues` query and JSON response while keeping the dev list unfiltered (shows both active and inactive venues). Verified task script now passes dev venues API active-field check; only UI story `deactivate-06` remains failing.
