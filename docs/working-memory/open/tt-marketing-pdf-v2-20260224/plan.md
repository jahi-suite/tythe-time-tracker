# Task: tt-marketing-pdf-v2-20260224

> Update the PDF generator to match the v2 marketing page. Run AFTER tt-marketing-page-v2-20260224.

## Goal

Rewrite `tt-ts/scripts/generate-marketing-pdf.mjs` so the PDF matches the v2 marketing page:
- Same copy (Constance hero, day-in-the-life pain, outcome-first features)
- Same aesthetic (late-night venue: deep navy/near-black, amber/gold accents)
- Brochure layout (multi-page, cover, 2-col where appropriate)

## Prerequisite

Run `./ralph/loops/tt-marketing-page-v2-20260224.sh` first. This task reads the v2 MarketingLandingPage.tsx and syncs the PDF to it.

## What to Sync

1. **Copy**: Extract all copy from MarketingLandingPage.tsx — hero, pain, features, how it works, testimonial, CTA. Use it verbatim or adapt for print.

2. **Aesthetic**: v2 uses late-night venue — deep navy/near-black bg, warm amber/gold accents. Apply to PDF: dark cover, amber section bars, cream/white text on dark.

3. **Structure**: Constance story as hero/cover. Day-in-the-life pain. Outcome-first features. Magazine-cover testimonial. Vivid CTA.

4. **Layout**: Multi-page brochure. addPage(). 2-column features if it fits. Accent bars, boxes. Print-ready.

## Key Files

- tt-ts/src/client/pages/MarketingLandingPage.tsx (source of truth for copy)
- tt-ts/scripts/generate-marketing-pdf.mjs (rewrite this)

## Verification

```bash
./ralph/verify-tt-marketing-pdf-v2-20260224.sh
```
