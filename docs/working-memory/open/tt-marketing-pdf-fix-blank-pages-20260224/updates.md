# Updates

## 2026-02-24

Task created. Run `./ralph/loops/tt-marketing-pdf-fix-blank-pages-20260224.sh` to fix blank pages.

Investigated `tt-ts/scripts/generate-marketing-pdf.mjs` and reproduced the issue (many blank pages caused the verifier to report `21` pages via grep fallback). Root cause was `pageChrome()` drawing footer text at `y = h - 18`, which is inside PDFKit's default bottom margin; each footer `doc.text()` call triggered an implicit page break.

Fixed by creating the PDF document with an explicit bottom margin of `0` (`margins: { top: 42, right: 42, bottom: 0, left: 42 }`) and keeping footer text non-flowing (`lineBreak: false`) in `pageChrome()`. Instrumented a temporary debug run to confirm only the four explicit `addPage()` calls occur after the cover page (total: 5 pages), then removed the instrumentation.
