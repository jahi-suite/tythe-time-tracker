# Task: tt-marketing-pdf-fix-text-overlap-20260224

> Fix text overlapping in the marketing PDF. Text blocks are drawn on top of each other.

## Goal

The right panel of the cover page has overlapping text: "managerBody" and "managerBody2" (and possibly bullets) are drawn at fixed y positions. When text wraps to multiple lines, it overflows into the next block's position. Fix by calculating text height before drawing the next block.

## Problem

`textBlock(text, x, y, width, opts)` draws text at a fixed y. The next `textBlock` is drawn at a fixed y (e.g. 188) regardless of how tall the first block was. If the first block wraps to 4 lines, it extends past 188 and overlaps the second block.

## Solution

1. Use `doc.heightOfString(text, { width, lineGap })` to get the height of text before drawing.
2. Track `y` after each text block: `y += heightOfString(...)` before drawing the next block.
3. Or: have `textBlock` return the final y position so the caller can position the next block.
4. Apply this pattern to all multi-block sections: cover right panel, pain moments, outcomes cards, mechanics, testimonial.

## Key File

- tt-ts/scripts/generate-marketing-pdf.mjs

## Verification

```bash
./ralph/verify-tt-marketing-pdf-fix-text-overlap-20260224.sh
```
