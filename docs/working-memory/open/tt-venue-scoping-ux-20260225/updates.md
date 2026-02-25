# tt-venue-scoping-ux-20260225 — Updates

> Ralph implements one story per iteration. Log progress here.

## Progress

- 2026-02-25: Task created. Ralph to implement.
- 2026-02-25 14:09:39 GMT: Completed `scope-01` (users API venue scoping). `/api/users` list/create now use `req.session.venue_id`, and user-route audit snapshots read venue-scoped users via `auth.getAllUsers(venueId)`.
