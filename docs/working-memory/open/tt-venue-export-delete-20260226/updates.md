# tt-venue-export-delete-20260226 — updates

Progress log. One story per iteration; commit after each.

## 2026-02-26 — ved-01-export-api ✅

Added `GET /:slug/export-account-data` endpoint to `tt-ts/src/server/routes/venues.ts`.
- Admin-only (requireAdmin middleware), session venue_id must match slug.
- Returns `{ venue, settings, users (no password hashes), time_entries }` as JSON.
- Sets `Content-Disposition: attachment; filename="tythe-export-{slug}-{date}.json"`.
- Placed before the `/:slug` catch-all route.
- Build passes. Verify script: 4/6 pass (export-api server check now green).
- Commit: ea39698
