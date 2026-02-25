# Task: tt-dev-venue-deactivate-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Add deactivate (and optionally reactivate) venue from Dev Venues page. Soft delete via `active` column. Tythe cannot be deactivated.

## Big picture

- **Existing**: Dev Venues page shows name, slug, staff count, last used. No way to remove or disable a venue.
- **New**: Soft deactivate — add `active` column. Deactivated venues hidden from search/login. Dev page gets Deactivate button (and Reactivate for inactive). Tythe is protected.
- **Do not break**: Auth, venue scoping, Clock, Manager, export, venue creation.

## Design decisions

1. **Soft delete**: Add `active BOOLEAN NOT NULL DEFAULT TRUE` to venues. Deactivate = set active=false. Data preserved.
2. **Filter inactive**: Venue search (GET /api/venues/search), getVenueBySlug, venue lookup for login — exclude inactive. Dev list shows all (active + inactive) with status.
3. **Tythe protected**: Never allow deactivating slug `tythe`. Return 400 if attempted.
4. **Reactivate**: Optional — add Reactivate button for inactive venues so devs can undo.

## Stories (one per iteration)

### Phase 1: DB and filtering

1. **deactivate-01** — Migration: add `active BOOLEAN NOT NULL DEFAULT TRUE` to venues. Backfill existing rows. Update `ensureVenueSettingsColumns` pattern or add `ensureVenueActiveColumn`.

2. **deactivate-02** — Filter inactive venues: update `getVenueBySlug` and `getVenueById` in auth to `WHERE ... AND active = true`. Update venue search (GET /api/venues/search) to `WHERE ... AND active = true`. Update GET /api/venues/:slug (public lookup) to exclude inactive. Inactive venues cannot be found for login or search.

### Phase 2: Dev API and UI

3. **deactivate-03** — Add `POST /api/dev/venues/:slug/deactivate`: require dev middleware. Set `active = false` for venue. If slug is `tythe`, return 400. Return 200 with updated venue or 404 if not found.

4. **deactivate-04** — Add `POST /api/dev/venues/:slug/reactivate`: set `active = true`. Same guards. Optional but useful.

5. **deactivate-05** — Update GET /api/dev/venues: include `active` in response. Dev list shows all venues (active and inactive).

6. **deactivate-06** — DevVenuesPage: add Actions column. For active venues (except Tythe): Deactivate button with confirm ("Deactivate {name}? They won't be able to log in."). For inactive: Reactivate button. Call API, then refresh list. Show "Inactive" badge in Status column for inactive rows.

### Phase 3: Verification

7. **deactivate-07** — Verify: build passes. Deactivate non-Tythe venue → no longer in search, cannot login. Reactivate → works again. Tythe deactivate returns 400. Dev page shows correct buttons and badges.

## Key paths

- `tt-ts/src/server/db/migrate.ts` — add active column
- `tt-ts/src/server/auth/index.ts` — getVenueBySlug, getVenueById filter by active
- `tt-ts/src/server/routes/venues.ts` — search and :slug filter by active
- `tt-ts/src/server/routes/dev.ts` — deactivate, reactivate, include active in GET
- `tt-ts/src/client/pages/DevVenuesPage.tsx` — Deactivate/Reactivate buttons, confirm, Status column

## Do not break

- Tythe must always be active and usable
- Existing logged-in sessions for a venue — if we deactivate while they're logged in, they can stay until logout; next login will fail. Acceptable.
- Venue creation still creates active venues

## Verification

```bash
./ralph/verify-tt-dev-venue-deactivate-20260225.sh
```
