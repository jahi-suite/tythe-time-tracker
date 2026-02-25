# Updates

## 2026-02-24

Task created. Run `./ralph/run.sh tt-marketing-pdf-brochure-20260224` to redesign the marketing PDF as a brochure.

Rewrote `tt-ts/scripts/generate-marketing-pdf.mjs` into a brochure-style PDF generator with a 3-page print-ready layout:
- cover page with green hero treatment, headline/tagline, built-by line, and CTA button
- second page with pain points, origin story panel, 2x3 feature grid, and how-it-works cards
- third page with Constance testimonial and closing CTA/footer block

Regenerated `tt-ts/marketing-page.pdf` from the updated script.
