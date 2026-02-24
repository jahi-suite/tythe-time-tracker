# Updates

## 2026-02-24

Task created. Run `./ralph/loops/tt-marketing-pdf-fix-cover-gap-20260224.sh` to fix the cover page gap.

- Updated `drawCoverPage()` in `tt-ts/scripts/generate-marketing-pdf.mjs` so the cover CTA bar uses content-based positioning (`contentBottom + 28`) instead of fixed bottom placement (`h - 118`).
- Regenerated `tt-ts/marketing-page.pdf` and `tt-ts/public/marketing-page.pdf`.
- Ran `./ralph/verify-tt-marketing-pdf-fix-cover-gap-20260224.sh` (passed).
- Visual PDF rendering was not possible in this shell session because PDF-to-image tools (`pdftoppm`, `mutool`, `magick`, `gs`) are not installed.
- Follow-up verification pass: fixed an unrelated `fullBleed()` regression in `tt-ts/scripts/generate-marketing-pdf.mjs` (`h` was undefined), regenerated both PDF outputs, and re-ran `./ralph/verify-tt-marketing-pdf-fix-cover-gap-20260224.sh` (passed).
