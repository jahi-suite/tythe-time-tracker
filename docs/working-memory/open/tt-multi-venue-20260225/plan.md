# Task: tt-multi-venue-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Multi-venue support with sign-up and venue select. Tythe must keep working (live site).

## Context

- App is single-tenant (Tythe only). Deployed on Google Cloud Run.
- Tythe is live — all changes must preserve existing behaviour.
- Need: venue sign-up (create venue + first admin), venue select (choose venue before login).

## Stories (one per iteration)

### Phase 1: DB foundation

1. **multi-venue-01** — Add `venues` table, `venue_id` to `users`, `time_entries`, `audit_log`. Migration seeds Tythe venue, backfills existing rows to Tythe, adds indexes/FKs. Add `DB.VENUES_TABLE`, `DB.VENUE_ID_COLUMN` to constants.

### Phase 2: Venue API

2. **multi-venue-02** — Add `GET /api/venues/search?q=` (public, returns `{ slug, name }[]`). Add `POST /api/venues` (venue name + admin credentials) — creates venue + first admin in one transaction, returns `redirectUrl`. Wire in `src/server/index.ts`.

### Phase 3: Auth venue scoping

3. **multi-venue-03** — Login requires `venue_slug` or `venue_id`. Session stores `user`, `venue_id`, `venue_slug`. `/api/auth/me` validates venue. `first-setup` checks venue existence. Client posts `venue_slug` (default `tythe`). Support `/:venueSlug/login`.

### Phase 4: Routing

4. **multi-venue-04** — Client routes: `/` = venue landing, `/:venueSlug/*` = app (login, clock, timesheet, export, manager). `VenueApp` validates slug via API. Redirect logged-in users to session venue.

### Phase 5: Venue landing UI

5. **multi-venue-05** — Venue landing: search (debounced) + create form. Search results navigate to `/:slug`. Create form calls `POST /api/venues`, redirects to new venue.

### Phase 6: API scoping

6. **multi-venue-06** — Scope time-entries, users, audit to session `venue_id`. All inserts write explicit `venue_id`.

### Phase 7: Polish

7. **multi-venue-07** — Layout shows venue name from context. Login page shows venue name. Invalid slug 404 with link back to search.

## Key paths

- `tt-ts/src/server/db/migrate.ts` — migrations
- `tt-ts/src/shared/constants.ts` — DB constants
- `tt-ts/src/server/routes/auth.ts` — login
- `tt-ts/src/server/index.ts` — API routes
- `tt-ts/src/client/App.tsx` — routing

## Verification

```bash
./ralph/verify-tt-multi-venue-20260225.sh
```
