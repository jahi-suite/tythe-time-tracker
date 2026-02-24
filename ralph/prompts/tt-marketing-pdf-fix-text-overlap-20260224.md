You are a Ralph execution agent fixing text overlap in the marketing PDF. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-marketing-pdf-fix-text-overlap-20260224/plan.md
- tt-ts/scripts/generate-marketing-pdf.mjs

## Task

Text blocks in the PDF are overlapping. The right panel of the cover page shows "managerBody" and "managerBody2" printed on top of each other. This happens because blocks are drawn at fixed y positions — when text wraps, it overflows into the next block.

### Fix

1. **Modify textBlock** to return the final y position after the text (y + height of rendered text). Or add a variant that does this.

2. **Use heightOfString** before drawing: `const h = doc.heightOfString(text, { width, lineGap })` — then the next block starts at `y + h + gap`.

3. **Apply to all multi-block sections**:
   - Cover right panel: managerBody, managerBody2, bullets — each must start below the previous
   - Pain page: moments — ensure no overlap
   - Outcomes: cards
   - Mechanics: steps and side panel
   - Testimonial: quote, body, payoff, name

4. **Run the script** and open the PDF to verify no overlapping text.

## Rules

- One commit after changes
- Conventional commit: `fix: prevent text overlap in marketing PDF`
- Update docs/working-memory/open/tt-marketing-pdf-fix-text-overlap-20260224/updates.md
