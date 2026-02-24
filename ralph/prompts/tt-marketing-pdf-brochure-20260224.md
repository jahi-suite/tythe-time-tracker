You are a Ralph execution agent redesigning the marketing PDF to brochure style. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-marketing-pdf-brochure-20260224/plan.md
- tt-ts/scripts/generate-marketing-pdf.mjs

## Task

Rewrite `tt-ts/scripts/generate-marketing-pdf.mjs` to produce a **brochure-style PDF**. The current output is plain and text-heavy. Make it print-ready and visually designed.

### Design Requirements (from plan)

1. **Cover page**: Bold headline "Stop chasing timesheets. Start running your venue." Tagline. "Built by a bar manager." Strong visual — green accent or background. CTA.

2. **Multi-page layout**: 2–3 pages. Clear section breaks. Not one long scroll.

3. **2-column features**: The 6 features in a 2×3 grid. Use PDFKit's ability to position text at x,y with width to create columns.

4. **Visual design**:
   - Barn palette: green #1e3a2a, tan #c4a574, cream #faf8f5, charcoal #1a1a1a
   - Accent bars (rectangles) to separate sections
   - Feature items in boxes or with subtle borders
   - Generous whitespace, margins 40–50pt

5. **Typography hierarchy**: Cover 24–28pt, section headings 16–18pt, body 10–11pt.

6. **Content**: Same copy as current (origin story, pain points, features, how it works, Constance testimonial, CTA). Just restructure and design it.

### Technical Notes

- PDFKit: `doc.rect(x, y, w, h).fill(color)` for boxes. `doc.text(str, x, y, { width })` for column width.
- Use `doc.addPage()` for new pages.
- Save to `tt-ts/marketing-page.pdf`.

## Rules

- One commit after changes
- Conventional commit: `feat: redesign marketing PDF as brochure`
- Update docs/working-memory/open/tt-marketing-pdf-brochure-20260224/updates.md with what you did
