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

Text blocks are STILL overlapping. The right panel of the cover page shows managerBody and managerBody2 on top of each other. Other sections may overlap too. You MUST fix this properly.

### Root cause

Blocks use fixed y positions. managerBody at y=116 and managerBody2 at y=188 — when managerBody wraps to 3+ lines, it extends past 188 and overlaps. Same for bullets.

### Required fix (cover right panel)

**Replace the fixed-y approach with dynamic positioning:**

```javascript
let y = 116
const panelW = contentW - 370
const opts = { fontSize: 11, lineGap: 4 }

const h1 = measure(copy.hero.managerBody, panelW, opts)
textBlock(copy.hero.managerBody, left + 358, y, panelW, opts)
y += h1 + 12

const h2 = measure(copy.hero.managerBody2, panelW, { ...opts, color: palette.cream })
textBlock(copy.hero.managerBody2, left + 358, y, panelW, { ...opts, color: palette.cream })
y += h2 + 16

copy.hero.bullets.forEach((line) => {
  doc.circle(left + 366, y + 5, 2.3).fill(palette.amber)
  const lineH = measure(line, panelW - 10, { fontSize: 10.2 })
  textBlock(line, left + 376, y, panelW - 10, { fontSize: 10.2, color: palette.cream })
  y += lineH + 2
})
```

### Apply same pattern everywhere

- **Left panel (Constance card)**: subhead, byline, role — use measure() and chain y
- **Pain page**: intro, moments — ensure each moment's y is below the previous
- **Outcomes, mechanics, testimonial**: every text block that has another below it must use heightOfString/measure to position the next

### Critical

Do NOT use any fixed y for a block that comes after another block of variable height. Always: `y += measure(previousText) + gap` before drawing the next.

## Rules

- One commit after changes
- Conventional commit: `fix: prevent text overlap in marketing PDF`
- Update docs/working-memory/open/tt-marketing-pdf-fix-text-overlap-20260224/updates.md
