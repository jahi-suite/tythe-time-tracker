# Task: tt-venue-supervisor-settings-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Add per-venue supervisor settings. Get them onto the UI and make them usable. Do not break existing behaviour.

## Big picture

- **Existing**: Supervisor is a role employees select when clocking in. Supervisor hours use supervisor pay rate (per-user). Supervisor is always available. Break deduction applies to supervisor hours when they're the majority.
- **New**: Venues can configure supervisor behaviour. Settings must appear in Venue Settings UI and take effect in Clock, Manager, and exports.
- **Backward compat**: Defaults must match current behaviour. Tythe and existing venues unchanged.

**Before each story**: What does this touch? Clock? Manager? Export? Auth? Ensure you don't break existing flows. Run build and verify after changes.

## Supervisor settings to add

| Setting | Type | Default | Purpose |
|--------|------|---------|---------|
| `supervisor_enabled` | boolean | true | If false, hide supervisor option in Clock and Manager. Existing Supervisor entries still display correctly. |
| `supervisor_label` | string | "Supervisor" | Display label (e.g. "Lead", "Key Holder"). Used in Clock checkbox, Manager forms, exports. |
| `supervisor_deduct_break` | boolean | true | Whether break deduction applies to supervisor hours. If false, supervisor hours are never reduced by break. |

## Stories (one per iteration)

### Phase 1: DB and backend

1. **supervisor-01** — Migration: add `supervisor_enabled`, `supervisor_label`, `supervisor_deduct_break` to venues table. Defaults: true, 'Supervisor', true. Backfill existing rows. Update `getVenueSettings` and VenueSettings type. Update venues PUT /:slug/settings to accept these fields.

2. **supervisor-02** — Add `GET /api/venues/current/settings` (or include settings in `/api/auth/me`): logged-in users need to read their venue's settings for Clock/Manager. Require auth, return session venue's settings. This lets Clock page know if supervisor is enabled without admin.

### Phase 2: Venue Settings UI (get onto UI early)

3. **supervisor-03** — VenueSettingsPage: add "Supervisor" fieldset with:
   - Checkbox: "Enable supervisor role" (supervisor_enabled)
   - Text input: "Label" (supervisor_label, placeholder "Supervisor")
   - Checkbox: "Deduct break from supervisor hours" (supervisor_deduct_break)
   Ensure form state includes new fields, API sends them, and UI is usable (clear labels, hints).

### Phase 3: Apply in logic

4. **supervisor-04** — `applyBreakDeduction` in exportUtils: when `supervisor_deduct_break` is false, do not deduct from Supervisor bucket (only from Standard/Enhanced). When true, keep current behaviour (deduct from majority).

5. **supervisor-05** — Clock page: fetch venue settings (from /me or /venues/current/settings). If `supervisor_enabled` is false, hide the "Supervisor Role" checkbox. Use `supervisor_label` for the checkbox label when shown.

6. **supervisor-06** — Manager page: when adding/editing shifts, if `supervisor_enabled` is false, hide supervisor checkbox and remove Supervisor from pay rate override dropdown. Use `supervisor_label` when shown. Fetch settings same way as Clock.

### Phase 4: Export and display

7. **supervisor-07** — Export: use `supervisor_label` in column headers / shift display when present. Ensure exportUtils and exportService pass venue settings through.

8. **supervisor-08** — Layout "Pay Rate Information" and any other hardcoded "Supervisor" text: consider venue context if settings are available, or leave as generic. Low priority.

### Phase 5: Verification

9. **supervisor-09** — Verify: build passes, Tythe unchanged. Manual: create venue with supervisor_enabled=false, confirm Clock and Manager hide supervisor. With supervisor_deduct_break=false, confirm export doesn't deduct break from supervisor hours.

## Key paths

- `tt-ts/src/server/db/migrate.ts` — new columns
- `tt-ts/src/server/auth/index.ts` — getVenueSettings, VenueSettings type
- `tt-ts/src/server/routes/venues.ts` — PUT settings, GET current/settings
- `tt-ts/src/server/services/exportUtils.ts` — applyBreakDeduction
- `tt-ts/src/client/pages/ClockPage.tsx` — supervisor checkbox
- `tt-ts/src/client/pages/ManagerPage.tsx` — add/edit shift forms
- `tt-ts/src/client/pages/VenueSettingsPage.tsx` — new fieldset
- `tt-ts/src/shared/types.ts` — VenueSettings

## Do not break

- Existing Supervisor time entries must still display and export correctly
- Tythe and venues with defaults must behave exactly as today
- Per-user supervisor_rate (Manager pay rates) unchanged
- Clock in/out, timesheet, export flows must keep working

## Verification

```bash
./ralph/verify-tt-venue-supervisor-settings-20260225.sh
```
