# tt-app-ui-20260225 — Updates

## Progress

(Agent updates this after each story.)

- 2026-02-25T21:11:42Z — `ui-login-style`: Restyled `LoginPage` and `FirstSetupPage` shared `.login-*` UI in `tt-ts/src/client/index.css` to marketing-inspired dark theme (`#0d0b09` night background, cream text, amber accents, Playfair Display headings / DM Sans body). Verified with `./ralph/verify-tt-app-ui-20260225.sh` (`Login styles use dark theme` now passes).
- 2026-02-25T21:13:45Z — `ui-venue-landing-style`: Restyled `tt-ts/src/client/pages/VenueLandingPage.tsx` inline styles to the same marketing-inspired dark/cream/amber theme (night background gradients, cream copy, amber CTAs, Playfair headings, DM Sans body) without changing any HTML pages. Re-ran `./ralph/verify-tt-app-ui-20260225.sh` (remaining failures are duplicate tabs + pay rates stories) and `cd tt-ts && npm run build` (pass).
- 2026-02-25T21:16:25Z — `ui-dedup-tabs`: Removed `TopNav` from `tt-ts/src/client/pages/Layout.tsx` and kept the existing `app-shell__nav` tab bar, eliminating duplicate workspace navigation links while preserving active-state routing behavior. Verified with `./ralph/verify-tt-app-ui-20260225.sh` (duplicate tabs check now passes; pay rates stories still pending).
