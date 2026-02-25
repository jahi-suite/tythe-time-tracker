# Task: tt-app-ui-20260225

> **Goal**: Apply marketing style across the entire app. Dark theme, cream text, amber accents, DM Sans + Playfair Display. Fix duplicate tabs and pay rates info box. Copy the vibe from karisuite.com — do not change marketing HTML.

## Problems

1. **App uses light/generic UI** — Should match marketing: dark background (--night #0d0b09), cream text (--cream #f3ede3), amber accents (--amber #c8853a), DM Sans + Playfair Display. Every page, card, button, form.
2. **Tabs bar repeats** — Layout renders TopNav AND app-shell__nav with same links.
3. **Pay rates info box** — Static text; should show user's actual rates.

## Constraints

- **Do not change HTML pages** (tt-ts/public/*.html, karisuite-site/*.html). Only React + CSS.
- Reference: karisuite.com, tt-ts/public/kari-time-marketing.html, karisuite-site/index.html for exact tokens and patterns.

## Design tokens (from marketing)

- `--night: #0d0b09` (background)
- `--cream: #f3ede3` (text)
- `--amber: #c8853a`, `--amber-l: #e8a855` (accents)
- `--muted: #76665a`
- `--rule: rgba(200,133,58,0.15)` (borders)
- `--card: rgba(255,255,255,0.028)` (card bg)
- Fonts: DM Sans (body), Playfair Display (headings, serif)

## Key paths

- `tt-ts/src/client/index.css` — global styles, tokens, all component styles
- `tt-ts/src/client/pages/` — LoginPage, VenueLandingPage, Layout, ClockPage, TimesheetPage, ExportPage, ManagerPage, VenueSettingsPage
- `tt-ts/src/client/components/` — TopNav, Footer, Container
- `tt-ts/index.html` — font preconnect (DM Sans, Playfair Display)

## Stories (order matters)

1. **ui-tokens** — Add marketing design tokens to index.css: --night, --cream, --amber, --amber-l, --muted, --rule, --card. Ensure DM Sans + Playfair Display loaded (index.html or existing). Base body/app background on --night.
2. **ui-shell** — Layout (app-shell): dark background, cream text, amber accents. Nav, intro section, support panels, main area. Match marketing card/border style.
3. **ui-login-style** — LoginPage and FirstSetupPage: dark theme, cream text, amber accents, marketing typography.
4. **ui-venue-landing-style** — VenueLandingPage: same marketing theme.
5. **ui-dedup-tabs** — Remove duplicate nav. One tab bar only (TopNav without page links, or app-shell__nav only).
6. **ui-pages** — ClockPage, TimesheetPage, ExportPage, ManagerPage, VenueSettingsPage: cards, buttons, forms, badges, inputs in marketing style (dark bg, cream text, amber accents, --rule borders).
7. **ui-components** — TopNav, Footer, Container: marketing style. Buttons (btn-primary, btn-secondary), cards, inputs, badges.
8. **ui-pay-rates-api** — Extend GET /auth/me to return standard_rate, enhanced_rate, supervisor_rate.
9. **ui-pay-rates-panel** — Layout pay-rate-info: show user's actual rates, update when changed.
10. **ui-verify** — npm run build passes. Full app matches marketing vibe. No duplicate tabs. Pay rates panel shows real data.

## Verification

```bash
cd tt-ts && npm run build
./ralph/verify-tt-app-ui-20260225.sh
# Manual: Full app dark theme; marketing vibe; no duplicate tabs; pay rates panel shows real data
```

## Affected files (expected)

- tt-ts/src/client/index.css — tokens, all component styles
- tt-ts/src/client/pages/*.tsx — all pages
- tt-ts/src/client/components/*.tsx — TopNav, Footer, Container
- tt-ts/index.html — fonts if needed
- tt-ts/src/client/api.ts, server routes/auth.ts, server/auth/index.ts, shared/types.ts — pay rates
