# Task: tt-marketing-pdf-fix-cover-gap-20260224

> Fix the big empty gap on the cover page between the content cards and the CTA bar.

## Goal

The cover page has a large empty dark space between the main content (Constance card, manager card) and the CTA bar at the bottom. Compact the layout so the CTA bar sits closer to the content — no big gap.

## Options

1. **Move CTA bar up**: Position the CTA bar (`doc.roundedRect(left, h - 118, ...)`) higher — e.g. use a fixed y based on content end, not `h - 118`.
2. **Reduce card heights**: If the cards have fixed heights that leave a gap, reduce them or make them content-based.
3. **Add content in the gap**: If the gap is intentional, fill it with something useful (e.g. a short tagline, visual element).
4. **Tighten vertical spacing**: Reduce padding/margins between sections so content flows down and the CTA bar follows.

Preferred: move the CTA bar up so it sits just below the content cards with minimal gap (e.g. 24–40pt).

## Key File

- tt-ts/scripts/generate-marketing-pdf.mjs

## Verification

```bash
./ralph/verify-tt-marketing-pdf-fix-cover-gap-20260224.sh
```
