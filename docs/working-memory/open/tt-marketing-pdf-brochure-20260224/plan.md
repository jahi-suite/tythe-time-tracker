# Task: tt-marketing-pdf-brochure-20260224

> Redesign the marketing PDF generator to produce a brochure-style, print-ready document.

## Goal

Rewrite `tt-ts/scripts/generate-marketing-pdf.mjs` so the output is a **brochure-style PDF** — professional, designed for print, not a plain text dump.

## Brochure Design Requirements

### Layout
- **Cover/front**: Bold headline, tagline, minimal text. Strong visual impact. Barn green background or accent bar.
- **Multi-page**: 2–3 pages with clear section breaks. Not one long scroll.
- **Columns**: Use 2-column layout for features (6 items in a 2×3 grid). Improves scanability.
- **Whitespace**: Generous margins, breathing room between sections. No cramped blocks.

### Typography
- **Hierarchy**: Clear distinction between cover title, section headings, subheads, body. Vary font sizes (e.g. 28pt cover, 16pt section, 11pt body).
- **Fonts**: Use Helvetica or similar. Consider Helvetica-Bold for headings, Helvetica for body.
- **Line length**: Keep body text to ~60–70 chars per line for readability.

### Visual Design
- **Barn palette**: Deep green (#1e3a2a), warm tan (#c4a574), cream (#faf8f5), charcoal (#1a1a1a). Use consistently.
- **Accent bars**: Green or tan horizontal bars to separate sections or underline headings.
- **Boxes**: Feature items in subtle bordered boxes or rounded-rect backgrounds.
- **Decorative**: Simple geometric accents (e.g. small squares, lines) — no clip art.

### Content Structure (suggested)
1. **Page 1 (Cover)**: Headline "Stop chasing timesheets. Start running your venue." + tagline + "Built by a bar manager" + Get Started CTA
2. **Page 2**: Pain point, Features (2-col grid), How it works (3 steps)
3. **Page 3**: Testimonial (Constance), CTA block, Footer

### Print-Ready
- A4 or Letter. Margins 40–50pt. Ensure no content is cut off.
- Output path: `tt-ts/marketing-page.pdf`

## Key File

- tt-ts/scripts/generate-marketing-pdf.mjs

## Verification

```bash
./ralph/verify-tt-marketing-pdf-brochure-20260224.sh
```
