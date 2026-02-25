# tt-venue-custom-rules-20260225 — Updates

> Ralph implements one story per iteration. Log progress here.

## Progress

- 2026-02-25: Task created. Ralph to implement.
- 2026-02-25 14:49:25 GMT: Completed `rules-01` by adding idempotent `venues` migration columns for per-venue enhanced/break settings (`enhanced_enabled`, enhanced window hours, break deduction flags/minutes/threshold) with Tythe-compatible defaults and backfill for existing rows.
- 2026-02-25 14:52:34 GMT: Completed `rules-02` by adding `getVenueSettings(venueId)` in `tt-ts/src/server/auth/index.ts` plus shared `VenueSettings` type, with default fallback to current Tythe enhanced/break behavior when venue ID is missing or not found.
