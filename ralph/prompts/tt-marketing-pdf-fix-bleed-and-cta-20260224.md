You are a Ralph execution agent fixing text bleeding and removing CTA from the marketing PDF. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-marketing-pdf-fix-bleed-and-cta-20260224/plan.md
- tt-ts/scripts/generate-marketing-pdf.mjs

## Task

### 1. Fix text bleeding outside boxes

Section bars and chips overlap card borders. "CONSTANCE BUILT THIS" and "FOR THE MANAGER DOING THREE JOBS AT ONCE" overlap the top-right corners of their cards. The "OUTCOME" labels on outcome cards may be bleeding or wrapping badly.

**Fix:**
- Draw section bars and chips INSIDE the card with proper inset. The card has rounded corners — the bar must not extend past the card's bounds. Use `x + 12` or similar inset from the card's left/top edge.
- For the chip on the left card: position it so it doesn't overlap the card's top-right corner. Either move it left, or make the card taller at the top to accommodate it.
- For "FOR THE MANAGER..." on the right card: same — ensure it's inside the card bounds with inset. If it overlaps the first line of body text, add more top padding to the card content.
- For "OUTCOME" labels: ensure the pill is wide enough. Use `lineBreak: false` or a wider rect so "OUTCOME" doesn't wrap. Or use a shorter label like "Outcome" if needed.
- Use `doc.save()` and `doc.clip()` if needed to clip content to card bounds.

### 2. Remove "CTA" from the document

"CTA" is internal — readers don't need to see it.

**Change:**
- `copy.cta.bar: 'Last orders CTA'` → `'Last orders'` or `'Get started'`
- `pageChrome('Testimonial + CTA', 5)` → `pageChrome('Testimonial', 5)` or similar
- Search for any other "CTA" in visible strings and remove it.

## Rules

- One commit after changes
- Conventional commit: `fix: prevent text bleed, remove CTA from PDF`
- Update docs/working-memory/open/tt-marketing-pdf-fix-bleed-and-cta-20260224/updates.md
