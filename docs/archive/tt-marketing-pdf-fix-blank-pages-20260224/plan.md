# Task: tt-marketing-pdf-fix-blank-pages-20260224

> Fix blank pages in the marketing PDF. The PDF should have exactly 5 pages of content, no extras.

## Goal

The marketing PDF (`tt-ts/scripts/generate-marketing-pdf.mjs`) is producing many blank pages. Fix it so the output has exactly 5 pages:
1. Cover (Constance story)
2. Pain (Saturday-night)
3. Outcomes
4. Mechanics (How it works)
5. Testimonial + CTA

No blank pages between or after.

## Likely Causes

- **Text overflow**: PDFKit auto-adds pages when text overflows. Use `heightOfString` to check fit, or constrain text with `continued: false` and explicit `y` so it doesn't flow off-page.
- **Content positioning**: Content placed below page bottom triggers new page. Ensure all `y` values stay within page height (A4 ~842pt).
- **doc.y**: If code uses `doc.y` after text and it's past the page bottom, next content may land on a new blank page.
- **Explicit addPage**: Only 4 `addPage()` calls (pages 2–5). Cover is page 1. Verify no extra addPage or accidental page breaks.

## Key File

- tt-ts/scripts/generate-marketing-pdf.mjs

## Verification

```bash
./ralph/verify-tt-marketing-pdf-fix-blank-pages-20260224.sh
```
