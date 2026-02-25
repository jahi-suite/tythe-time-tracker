# Task: tt-venue-scoping-ux-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Fix venue data scoping, logo display, and logout flow. Non-Tythe venues (e.g. Jkahi Suite) must see only their own staff and data.

## Problems

1. **Data scoping**: When logged into a non-Tythe venue (e.g. Jkahi Suite), Manager Dashboard shows Tythe staff. Users, timesheets, shifts, export, audit must be scoped to session venue.
2. **Tythe logo**: tythe-logo.png appears for all venues. It is Tythe's logo — other venues should see a generic logo (kari-logo or placeholder) until logo upload is added later.
3. **Logout**: Logout redirects to `/:slug/login`. Should redirect to `/venues` (venue pick page) so user can choose a different venue.

## Stories (one per iteration)

### Phase 1: API data scoping

1. **scope-01** — Scope `/api/users` to session venue. Add `getUsersByVenueId(venueId)` (or extend `getAllUsers` to accept optional venueId). Users route reads `req.session.venue_id` and passes to auth. Create user must use session venue_id.

2. **scope-02** — Scope time-tracking to session venue. Repository: `getEmployeeTimesheetByUserId`, `getEmployeeTimesheet`, `getAllTimesheets`, `createTimeEntry` — add venue_id filter. timeTracking service and clock/timesheet/shifts routes pass session venue_id.

3. **scope-03** — Scope export and audit to session venue. Export service and audit log reads must filter by venue_id.

### Phase 2: Logo and UX

4. **scope-04** — Logo: show tythe-logo.png only when `user?.venue?.slug === 'tythe'`. For other venues, use kari-logo.png or a generic placeholder (e.g. venue name initial). Apply in Layout.tsx, LoginPage.tsx, FirstSetupPage.tsx.

5. **scope-05** — Logout: redirect to `/venues` (venue pick page) instead of `/:slug/login`. Update Layout handleLogout.

### Phase 3: Verification

6. **scope-06** — Run verify script. Manually test: create venue, add user, log in as that venue — Manager should show only that venue's users. Logout should land on /venues.

## Key paths

- `tt-ts/src/server/routes/users.ts` — getAllUsers, createUser (pass venue)
- `tt-ts/src/server/auth/index.ts` — getAllUsers → getUsersByVenueId or add venueId param
- `tt-ts/src/server/db/repository.ts` — time entry queries need venue_id
- `tt-ts/src/server/services/timeTracking.ts` — pass venueId
- `tt-ts/src/server/routes/timesheet.ts`, `shifts.ts`, `clock.ts` — session venue_id
- `tt-ts/src/server/routes/export.ts` — venue scope
- `tt-ts/src/server/audit.ts` — venue scope
- `tt-ts/src/client/pages/Layout.tsx` — logo, logout redirect
- `tt-ts/src/client/pages/LoginPage.tsx` — logo

## Verification

```bash
./ralph/verify-tt-venue-scoping-ux-20260225.sh
```
