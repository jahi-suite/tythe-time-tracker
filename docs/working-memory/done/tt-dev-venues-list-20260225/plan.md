# Task: tt-dev-venues-list-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Dev-only view of all venues: names, staff count, last used. No private venue info. Env-gated with optional dev secret.

## Big picture

- **Purpose**: Developers need a quick overview of venues in the system — which exist, how many staff, when last active. No sensitive data.
- **Access**: Env-gated. Optional dev secret for staging. Never exposed in production unless explicitly enabled.
- **Do not break**: Existing auth, venue scoping, Clock, Manager, export — untouched.

## Design decisions

1. **Env gate**: `DEV_VENUES_ENABLED=true` — feature only exists when set. In production, leave unset.
2. **Optional dev secret**: `DEV_SECRET` — if set, require it (header or cookie). If unset, env gate alone is enough (local dev).
3. **Data**: `name`, `slug`, `staff_count`, `last_used` (ISO string or null). No emails, rates, or other private info.
4. **Last used**: Most recent activity for that venue — `MAX(COALESCE(clock_out, clock_in))` from `time_entries` where `venue_id` matches. Null if no entries.
5. **Staff count**: `COUNT(*)` from `users` where `venue_id` matches.

## Stories (one per iteration)

### Phase 1: API

1. **dev-venues-01** — Add `GET /api/dev/venues` route:
   - Guard: if `DEV_VENUES_ENABLED !== 'true'`, return 404 (route not registered or returns 404)
   - If `DEV_SECRET` is set: require `X-Dev-Secret` header or `dev_secret` cookie to match. Return 401 if missing/wrong.
   - Query: `venues` joined with `(SELECT venue_id, COUNT(*) FROM users GROUP BY venue_id)` and `(SELECT venue_id, MAX(COALESCE(clock_out, clock_in)) FROM time_entries GROUP BY venue_id)`
   - Response: `[{ name, slug, staff_count, last_used }]` — last_used as ISO string or null
   - Mount under `/api/dev/` — new router or inline in index

2. **dev-venues-02** — Add dev middleware or helper: `requireDevVenuesEnabled` — checks env, returns 404 if disabled. `requireDevSecret` — if DEV_SECRET set, checks header/cookie. Reuse in dev routes.

### Phase 2: Frontend

3. **dev-venues-03** — Add `DevVenuesPage` at `/dev/venues`:
   - Fetches `GET /api/dev/venues`. If 404, show "Dev venues list is disabled. Set DEV_VENUES_ENABLED=true to enable."
   - If 401 (secret required): show inline form "Dev secret" → on submit, set `dev_secret` cookie (httpOnly optional, path=/), refetch
   - On success: render table with columns: Name, Slug, Staff, Last used (formatted, e.g. "2 days ago" or ISO)
   - Route: add `/dev/venues` — accessible without venue login (e.g. from marketing/landing state, or always routable)
   - Minimal styling — readable, not fancy

4. **dev-venues-04** — Wire route in App.tsx: add `/dev/venues` so it's reachable. Ensure it works when user is logged out (most common dev case). If 404 from API, page handles gracefully.

### Phase 3: Verification

5. **dev-venues-05** — Verify: build passes. With `DEV_VENUES_ENABLED=true` and no `DEV_SECRET`, `/api/dev/venues` returns data. With `DEV_SECRET` set, 401 without secret, 200 with correct header. Page renders table. Without env, 404.

## Key paths

- `tt-ts/src/server/index.ts` — mount dev routes
- `tt-ts/src/server/routes/dev.ts` (new) — GET /venues
- `tt-ts/src/server/db/` — query venues + users count + time_entries max
- `tt-ts/src/client/pages/DevVenuesPage.tsx` (new)
- `tt-ts/src/client/App.tsx` — add route

## Do not break

- Venue scoping for logged-in users
- Auth flows (login, session, logout)
- Clock, Manager, Timesheet, Export
- Venue creation, venue settings

## Verification

```bash
./ralph/verify-tt-dev-venues-list-20260225.sh
```
