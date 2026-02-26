# tt-venue-export-delete-20260226 — updates

## 2026-02-26 — ved-04-delete-ui ✅ + ved-05-verify ✅

Added `deleteAccount(slug)` to `venues` in `tt-ts/src/client/api.ts` (POST /venues/:slug/delete-account).
Added "Delete account" section to `VenueSettingsPage.tsx`:
- Danger-styled button opens a confirmation modal.
- Modal requires typing exact venue name before confirm button enables.
- On confirm: calls `venues.deleteAccount(slug)`, calls `logout()`, then `window.location.href = result.redirectUrl`.
- Inline error shown on API failure; cancel/disabled-during-delete handled.
- Also added CSS for modal overlay, modal box, and `.btn-danger`.
Build passes (npm run build). Verify script: 6/6 pass.
All stories pass. Task complete.
Commits: c8947fe (feat), then docs commit.

Progress log. One story per iteration; commit after each.

## 2026-02-26 — ved-03-delete-api ✅

Added `POST /:slug/delete-account` endpoint to `tt-ts/src/server/routes/venues.ts`.
- Admin-only (requireAdmin), session venue_id must match slug.
- Blocks founder venue (is_founder=true) with 403.
- Deletes in FK-safe order in a transaction: time_entries → users → venue.
- On success: destroys session via `req.session.destroy()`, returns `{ ok: true, redirectUrl: '/venues' }`.
- Build passes. Verify: 5/6 pass (only failing check is delete UI in VenueSettingsPage.tsx — next story).
- Commit: 18fbcf2

## 2026-02-26 — ved-02-export-ui ✅

Added `venues.exportAccountData(slug)` to `tt-ts/src/client/api.ts` (returns download URL).
Added "Export account data" section with button to `VenueSettingsPage.tsx`; onClick sets `window.location.href` to trigger browser file download.
Verify: 5/6 pass (remaining fail is delete UI, next story). Build passes.
Commit: ccba037

## 2026-02-26 — ved-01-export-api ✅

Added `GET /:slug/export-account-data` endpoint to `tt-ts/src/server/routes/venues.ts`.
- Admin-only (requireAdmin middleware), session venue_id must match slug.
- Returns `{ venue, settings, users (no password hashes), time_entries }` as JSON.
- Sets `Content-Disposition: attachment; filename="tythe-export-{slug}-{date}.json"`.
- Placed before the `/:slug` catch-all route.
- Build passes. Verify script: 4/6 pass (export-api server check now green).
- Commit: ea39698
