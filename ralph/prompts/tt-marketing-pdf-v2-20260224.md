You are a Ralph execution agent syncing the PDF to the v2 marketing page. Fresh context — everything you need is on disk.

## Prerequisite

This task runs AFTER the marketing page v2 rewrite. If MarketingLandingPage.tsx still has the old copy (cream background, "Clock in, export, done" hero), run `./ralph/run.sh tt-marketing-page-v2-20260224` first.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-marketing-pdf-v2-20260224/plan.md
- tt-ts/src/client/pages/MarketingLandingPage.tsx (v2 — source of truth)
- tt-ts/scripts/generate-marketing-pdf.mjs (rewrite this)

## Task

Rewrite `tt-ts/scripts/generate-marketing-pdf.mjs` so the PDF matches the v2 marketing page.

### 1. Extract Copy from v2

Read MarketingLandingPage.tsx. Extract:
- Hero headline and subhead (Constance story)
- Pain section copy
- Feature titles and descriptions (outcome-first)
- How it works steps
- Testimonial (Constance)
- CTA copy

Use this copy in the PDF. Do NOT use the old brochure copy.

### 2. Apply v2 Aesthetic

v2 uses late-night venue: deep navy/near-black background, warm amber/gold accents. In the PDF:
- Cover: dark background (#0f172a or similar), amber/gold headline
- Section bars: amber (#f59e0b or #fbbf24)
- Body text: cream/white on dark, or charcoal on cream for contrast
- No barn green as primary — that was v1. v2 is darker, warmer.

### 3. Brochure Layout

- Multi-page (addPage)
- Cover with Constance hero
- Day-in-the-life pain section
- Outcome-first features (2-col if it fits)
- Magazine-cover style testimonial
- Vivid CTA (not "Get started. No credit card.")
- Footer

### 4. Output

- Save to tt-ts/marketing-page.pdf
- Copy to tt-ts/public/marketing-page.pdf so it's downloadable when app runs

## Rules

- One commit after changes
- Conventional commit: `feat: sync PDF to v2 marketing page copy and aesthetic`
- Update docs/working-memory/open/tt-marketing-pdf-v2-20260224/updates.md
