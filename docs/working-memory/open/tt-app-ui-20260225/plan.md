# Task: tt-app-ui-20260225

> **Goal**: Fix app UI issues: venue login styling, duplicate tabs bar, and pay rates info box not updating.

## Problems

1. **Venue login styling** — LoginPage and VenueLandingPage use a light, generic look. Should match marketing (karisuite.com): dark background (--night), cream text (--cream), amber accents (--amber), DM Sans + Playfair Display typography.
2. **Tabs bar repeats** — Layout renders TopNav (Clock, Timesheet, Exports, Manager, Venue) AND app-shell__nav with the same links. Same navigation appears twice.
3. **Pay rates info box** — Layout's pay-rate-info panel shows static text ("Rules: Standard (4AM-7PM)..."). Should display the current user's actual pay rates (standard, enhanced, supervisor £/hr) and update when they change.

## Constraints

- **Do not change HTML pages** (tt-ts/public/*.html, karisuite-site/*.html). Only React components and CSS.
- Reference: karisuite.com and tt-ts/public/kari-time-marketing.html for marketing style (dark theme, amber, cream).

## Key paths

- `tt-ts/src/client/pages/LoginPage.tsx` — LoginPage, FirstSetupPage
- `tt-ts/src/client/pages/VenueLandingPage.tsx` — venue find/create
- `tt-ts/src/client/pages/Layout.tsx` — TopNav + app-shell__nav (duplicate), pay-rate-info panel
- `tt-ts/src/client/components/TopNav.tsx` — top nav component
- `tt-ts/src/client/index.css` — login-page, login-hero, login-form, app-shell styles
- `tt-ts/src/client/api.ts` — AuthUser, auth.me (may need pay rates in response)
- `tt-ts/src/server/routes/auth.ts` — GET /auth/me (extend to include pay rates if needed)

## Stories (order matters)

1. **ui-login-style** — Restyle LoginPage and FirstSetupPage to match marketing: dark background (--night #0d0b09), cream text, amber accents, DM Sans/Playfair Display. Update .login-page, .login-hero, .login-form in index.css. Leave HTML pages unchanged.
2. **ui-venue-landing-style** — Restyle VenueLandingPage to match same marketing theme (dark, cream, amber).
3. **ui-dedup-tabs** — Remove duplicate nav. Keep ONE tab bar. Either remove TopNav from Layout when logged in and keep app-shell__nav, or merge: single nav bar, no repetition. Layout currently has TopNav + app-shell__nav with same links.
4. **ui-pay-rates-api** — Extend GET /auth/me (or add GET /users/me/pay-rates) to return current user's standard_rate, enhanced_rate, supervisor_rate. AuthUser type and getAuthUserById may need extension.
5. **ui-pay-rates-panel** — Layout pay-rate-info panel: fetch current user's pay rates, display "Standard £X/hr, Enhanced £Y/hr, Supervisor £Z/hr" (or "Not set" where null). Update when user changes password or when manager updates their rates (refresh on focus or after a mutation).
6. **ui-verify** — Verify: npm run build passes, no duplicate tabs, login/venue-landing match marketing look, pay rates panel shows real data.

## Verification

```bash
cd tt-ts && npm run build
# Manual: Login page dark theme; no duplicate tabs; pay rates info shows user's rates
```

## Affected files (expected)

- tt-ts/src/client/pages/LoginPage.tsx
- tt-ts/src/client/pages/VenueLandingPage.tsx
- tt-ts/src/client/pages/Layout.tsx
- tt-ts/src/client/index.css
- tt-ts/src/client/api.ts (AuthUser interface if pay rates added)
- tt-ts/src/server/routes/auth.ts (GET /me response)
- tt-ts/src/server/auth/index.ts (getAuthUserById if extending)
- tt-ts/src/shared/types.ts (AuthUser if extending)
