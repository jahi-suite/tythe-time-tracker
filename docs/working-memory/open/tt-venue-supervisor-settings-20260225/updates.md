# tt-venue-supervisor-settings-20260225 — Updates

> Ralph implements one story per iteration. Log progress here.

## Progress

- 2026-02-25: Task created. Ralph to implement.
- 2026-02-25T15:13:06+00:00: Completed `supervisor-01` (migration/backend settings support). Added venue columns `supervisor_enabled` (default true), `supervisor_label` (default "Supervisor"), and `supervisor_deduct_break` (default true) with backfill in `migrate.ts`; extended shared/client `VenueSettings` types and `getVenueSettings` defaults/reads; updated `PUT /api/venues/:slug/settings` to accept and validate supervisor settings.
- 2026-02-25T15:16:34+00:00: Completed `supervisor-02` (auth venue settings read path). Added `GET /api/venues/current/settings` (auth required) to return session venue settings for non-admin pages; added client `venues.currentSettings()` API helper and a no-op Clock preload call to establish the authenticated fetch path without changing Clock behavior.
- 2026-02-25T15:18:56+00:00: Completed `supervisor-03` (Venue Settings UI). Added a Supervisor fieldset to `VenueSettingsPage` with enable checkbox, label text input, and supervisor break deduction checkbox; wired new fields into form state load/save so venue settings API updates include supervisor settings.
- 2026-02-25T15:20:47+00:00: Completed `supervisor-04` (export break deduction setting). Updated `applyBreakDeduction` in `exportUtils` to honor venue `supervisor_deduct_break`: when false, the 20-minute break deduction is applied only to Standard/Enhanced buckets; when true (default), existing majority-based behavior including Supervisor is unchanged.
