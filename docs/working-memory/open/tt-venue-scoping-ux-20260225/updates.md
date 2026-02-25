# tt-venue-scoping-ux-20260225 — Updates

> Ralph implements one story per iteration. Log progress here.

## Progress

- 2026-02-25: Task created. Ralph to implement.
- 2026-02-25 14:09:39 GMT: Completed `scope-01` (users API venue scoping). `/api/users` list/create now use `req.session.venue_id`, and user-route audit snapshots read venue-scoped users via `auth.getAllUsers(venueId)`.
- 2026-02-25 14:14:06 GMT: Completed `scope-02` (time-tracking venue scoping). `time_entries` repo reads/writes now accept `venueId` filters (timesheets, open shifts, shift CRUD), and `clock`/`timesheet`/`shifts` routes require session `venue_id` and pass it through `timeTracking`.
