# Task: tt-venue-export-delete-20260226

> **Goal**: In venue settings, add buttons to export account data and to delete account (venue + related data). Admin-only, with confirmation for delete.

## Objective

- **Export**: One-click download of all venue account data (venue info, settings, staff list, time entries) as a JSON file.
- **Delete**: Button to permanently delete the venue and all related data, with explicit confirmation (e.g. type venue name or confirm modal). After delete: clear session, redirect to venue list/login.

## Scope

- **Who**: Only venue admins (same as existing Venue settings page).
- **Where**: Venue settings page (`/venue-settings`), below or after the existing "Save settings" form.
- **Founder**: Tythe Barn (slug `tythebarn`) may be protected from delete (optional: block delete for founder venue to avoid accidents). Export allowed for all.

## Export payload (JSON)

Include in the export file:

- **Venue**: id, slug, name, active, created_at, and any public/settings columns (e.g. email_verified, admin_email if present).
- **Venue settings**: Full venue settings row (enhanced_*, break_*, supervisor_*, etc.).
- **Users**: For this venue: id, username, display_name, role, standard_rate, enhanced_rate, supervisor_rate, created_at (no password hashes).
- **Time entries**: For this venue: id, user_id, employee, clock_in, clock_out, pay_rate_type, created_at.

Format: single JSON object, e.g. `{ "venue": {...}, "settings": {...}, "users": [...], "time_entries": [...] }`. Filename suggestion: `tythe-export-{slug}-{date}.json`.

## Delete behavior

- Require confirmation (e.g. modal with "Type venue name to confirm" or "I understand this cannot be undone" checkbox + button).
- Delete or soft-delete in an order that respects FKs: e.g. time_entries, audit_log (if scoped to venue), users, venue_settings (if separate table), then venue. If soft-delete: set venue.active = false and optionally clear/minimize related data per product decision.
- After successful delete: destroy session (logout), redirect to `/venues` or login so user cannot continue in app.
- If founder venue (tythebarn): either block delete with a clear message or allow (implementation choice; document in code).

## Key paths

- `tt-ts/src/client/pages/VenueSettingsPage.tsx` — Add "Export account data" and "Delete account" buttons; export triggers download; delete shows confirmation then calls API.
- `tt-ts/src/client/api.ts` — Add `venues.exportAccountData(slug)` and `venues.deleteAccount(slug, confirmation?)` (or equivalent).
- `tt-ts/src/server/routes/venues.ts` — New endpoints: `GET /api/venues/:slug/export-account-data` (returns JSON; or POST that returns blob), `POST /api/venues/:slug/delete-account` (body: confirmation if needed). Both require admin, session venue must match slug.
- `tt-ts/src/server/auth/index.ts` or db layer — Helpers to fetch venue + settings + users + time_entries for a venue for export; and to delete venue and related data (or soft-delete).

## Stories (order matters)

1. **ved-01-export-api** — Backend: GET (or POST) endpoint for export. Returns JSON with venue, settings, users (no password hashes), time_entries for session venue. Admin-only, session venue_id must match slug.
2. **ved-02-export-ui** — Frontend: "Export account data" button on Venue settings. Calls API, triggers download of JSON file (e.g. `tythe-export-{slug}-{date}.json`).
3. **ved-03-delete-api** — Backend: POST endpoint to delete venue and related data. Admin-only, session venue matches slug. Optional: reject if slug is tythebarn (founder). On success: destroy session and return 200 with redirect URL or message.
4. **ved-04-delete-ui** — Frontend: "Delete account" button. Confirmation modal (e.g. type venue name or confirm text). On confirm, call delete API; then logout and redirect to `/venues` or login.
5. **ved-05-verify** — Verification script and npm run build pass. Manual: export downloads file; delete requires confirm, then session cleared and redirect.

## Verification

```bash
cd tt-ts && npm run build
./ralph/verify-tt-venue-export-delete-20260226.sh
```

## Security / UX

- No password hashes or tokens in export.
- Delete must require explicit confirmation; session must be destroyed after delete.
- All endpoints must enforce admin and session venue match.
