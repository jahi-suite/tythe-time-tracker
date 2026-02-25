# tt-venue-scoping-ux-20260225 — Updates

> Ralph implements one story per iteration. Log progress here.

## Progress

- 2026-02-25: Task created. Ralph to implement.
- 2026-02-25 14:09:39 GMT: Completed `scope-01` (users API venue scoping). `/api/users` list/create now use `req.session.venue_id`, and user-route audit snapshots read venue-scoped users via `auth.getAllUsers(venueId)`.
- 2026-02-25 14:14:06 GMT: Completed `scope-02` (time-tracking venue scoping). `time_entries` repo reads/writes now accept `venueId` filters (timesheets, open shifts, shift CRUD), and `clock`/`timesheet`/`shifts` routes require session `venue_id` and pass it through `timeTracking`.
- 2026-02-25 14:16:45 GMT: Completed `scope-03` (export/audit venue scoping). Export PDF/Excel routes now require `req.session.venue_id` and pass it into venue-scoped timesheet reads; audit route now requires session `venue_id` and repository `getAuditLogs` filters by `venue_id`.
- 2026-02-25 14:19:26 GMT: Completed `scope-04` (venue-aware logo display). `Layout.tsx`, `LoginPage`, and `FirstSetupPage` now show `tythe-logo.png` only for `tythe`; other venues use `kari-logo.png`.
- 2026-02-25 14:21:18 GMT: Completed `scope-05` (logout UX redirect). `Layout.tsx` logout flow now redirects to `/venues` after session logout so users return to the venue picker.
