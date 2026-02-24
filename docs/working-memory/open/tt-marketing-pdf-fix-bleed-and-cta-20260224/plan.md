# Task: tt-marketing-pdf-fix-bleed-and-cta-20260224

> Fix text bleeding outside boxes and remove internal "CTA" labels from the document.

## Goal

1. **Text bleeding**: Section bars ("CONSTANCE BUILT THIS", "FOR THE MANAGER..."), chips, and "OUTCOME" labels overlap or bleed outside their card borders. Fix so all elements stay inside their containers — no overlap with card edges or content.

2. **Remove CTA from document**: "CTA" is internal jargon. Remove it from visible copy:
   - "Last orders CTA" → "Last orders" or "Get started"
   - "Testimonial + CTA" (in page chrome) → "Testimonial" or similar
   - Any other "CTA" text visible on the PDF

## Bleeding Fixes

- **Section bars**: Draw them fully inside the card with inset (e.g. 12pt from card edge). Or draw the card first, then the bar as a child element with correct bounds.
- **Chips** ("Constance built this", "For the manager..."): Ensure they don't overlap the card's rounded corners. Position inside the card top with margin.
- **OUTCOME labels**: The pill may be too small — "OUTCOME" wrapping to "OUTCOME" + "E" or bleeding. Widen the pill or reduce font size so it fits. Ensure the label stays inside its box.
- **All text**: Use `continued: false` and explicit bounds. Ensure no text block extends past its container.

## Key File

- tt-ts/scripts/generate-marketing-pdf.mjs

## Verification

```bash
./ralph/verify-tt-marketing-pdf-fix-bleed-and-cta-20260224.sh
```
