# Updates

## 2026-02-24

Task created. Run `./ralph/loops/tt-marketing-pdf-fix-text-overlap-20260224.sh` to fix text overlap.

- Replaced fixed `y` stacking with `measure()`-driven layout in `tt-ts/scripts/generate-marketing-pdf.mjs` for cover panels, pain moments/closer, outcomes cards/callout, mechanics cards, testimonial, and CTA.
- Regenerated `tt-ts/marketing-page.pdf` and `tt-ts/public/marketing-page.pdf`.
- Verified with `./ralph/verify-tt-marketing-pdf-fix-text-overlap-20260224.sh` (pass).
