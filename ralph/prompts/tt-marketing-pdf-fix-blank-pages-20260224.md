You are a Ralph execution agent fixing blank pages in the marketing PDF. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-marketing-pdf-fix-blank-pages-20260224/plan.md
- tt-ts/scripts/generate-marketing-pdf.mjs

## Task

The marketing PDF has many blank pages. It should have exactly 5 pages. Fix the script.

### Likely Causes

1. **Text overflow**: PDFKit adds new pages when text doesn't fit. Use `heightOfString()` to check before drawing, or pass `height` to `text()` to truncate/ellipsize. Avoid unbounded text that can flow off the page.

2. **Content below page bottom**: A4 height ~842pt. If any content is placed with `y > 800` or similar, it may trigger a new page. Ensure each section fits. Reduce font sizes or trim copy if needed.

3. **doc.y after text**: `doc.text()` advances `doc.y`. If you then draw at `doc.y` and it's past the page, you get a new page. Track `y` explicitly per section instead of relying on doc.y.

4. **Rounded rects / cards**: Ensure card heights and positions don't push content off-page. Recalculate layout so everything fits.

### What to Do

- Run the script, open the PDF, count pages.
- Identify which sections overflow or cause blank pages.
- Fix: constrain text, reduce heights, or split content so each page fits within A4.
- Target: exactly 5 pages, no blanks.

## Rules

- One commit after changes
- Conventional commit: `fix: remove blank pages from marketing PDF`
- Update docs/working-memory/open/tt-marketing-pdf-fix-blank-pages-20260224/updates.md
