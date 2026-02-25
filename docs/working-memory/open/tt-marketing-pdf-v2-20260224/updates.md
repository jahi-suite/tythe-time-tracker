# Updates

## 2026-02-24

Task created. Run AFTER `./ralph/run.sh tt-marketing-page-v2-20260224`.

Then: `./ralph/run.sh tt-marketing-pdf-v2-20260224`

Completed Ralph execution pass:
- Rewrote `tt-ts/scripts/generate-marketing-pdf.mjs` to use v2 marketing page copy (Constance hero/story, Saturday-night pain timeline, outcome-first cards, mechanics/how-it-works, Constance testimonial, last-orders CTA).
- Replaced v1 barn-green brochure styling with v2 late-night palette (deep navy/near-black backgrounds, amber/gold accents, cream text).
- Built a multi-page brochure layout with dedicated cover, pain, outcomes, mechanics, testimonial, and CTA pages.
- Script now writes `tt-ts/marketing-page.pdf` and copies it to `tt-ts/public/marketing-page.pdf`.
- Regenerated both PDFs from the updated script.
