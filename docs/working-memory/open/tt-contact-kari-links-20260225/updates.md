# tt-contact-kari-links-20260225 — Updates

> Ralph implements one story per iteration. Log progress here.

## Progress

- 2026-02-25: Task created. Ralph to implement.
- 2026-02-25T16:22:16Z: Completed `links-01` (contact email updates). Added `mailto:jahi@karisuite.com` to the privacy policy Contact & Complaints section text and privacy query block, and added a marketing footer `Contact us` mailto link. Verified with `./ralph/verify-tt-contact-kari-links-20260225.sh` (contact checks now pass; Kari Suite link stories remain pending).
- 2026-02-25T16:24:02Z: Completed `links-02` (marketing footer Kari Suite link). Updated `tt-ts/public/kari-time-marketing.html` so "Powered by Kari Suite" links to `https://karisuite.com` with `target="_blank"` and `rel="noopener noreferrer"`. Verified with `./ralph/verify-tt-contact-kari-links-20260225.sh` (marketing Kari Suite link check passes; privacy/layout Kari Suite link stories still pending).
- 2026-02-25T16:26:07Z: Completed `links-03` (privacy policy footer Kari Suite link). Updated `tt-ts/public/privacy-policy.html` so the footer "Powered by Kari Suite" links to `https://karisuite.com` in a new tab with `rel="noopener noreferrer"`. Verified with `./ralph/verify-tt-contact-kari-links-20260225.sh` (privacy HTML Kari Suite link check now passes; layout footer story remains pending).
- 2026-02-25T16:28:00Z: Completed `links-04` (app layout footer Kari Suite link). Updated `tt-ts/src/client/pages/Layout.tsx` to make "Powered by Kari Suite" an external link to `https://karisuite.com` with `target="_blank"` and `rel="noopener noreferrer"`, and added footer link styling in `tt-ts/src/client/index.css` so the link inherits footer color. Verified with `./ralph/verify-tt-contact-kari-links-20260225.sh` (all checks passing; `links-05` verification story remains).
