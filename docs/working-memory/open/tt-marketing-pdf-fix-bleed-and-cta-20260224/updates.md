# Updates

## 2026-02-24

Task created. Run `./ralph/run.sh tt-marketing-pdf-fix-bleed-and-cta-20260224` to fix text bleeding and remove CTA.

Implemented PDF layout fixes in `tt-ts/scripts/generate-marketing-pdf.mjs`:
- moved cover-page chip and manager label bar fully inside their cards with insets
- made section bars auto-size for wrapped labels (prevents text bleeding out of bars)
- widened/fixed outcome label pill text so `OUTCOME` stays on one line
- removed visible `CTA` wording (`Last orders`, `Testimonial`)
