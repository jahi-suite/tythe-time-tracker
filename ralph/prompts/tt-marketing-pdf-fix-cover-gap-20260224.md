You are a Ralph execution agent fixing the big gap on the cover page of the marketing PDF. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-marketing-pdf-fix-cover-gap-20260224/plan.md
- tt-ts/scripts/generate-marketing-pdf.mjs

## Task

The cover page has a large empty gap between the main content (Constance card + manager card) and the CTA bar at the bottom. Fix it.

### What to Do

1. **Inspect drawCoverPage()**: The CTA bar is positioned with `h - 118` (near bottom of page). The content cards end much higher, leaving a big dark gap.

2. **Move CTA bar up**: Position the CTA bar just below the content cards. Track the bottom y of the cards (e.g. cards end around y=438, bullets end around y=350). Place the CTA bar at `contentBottom + 24` or similar — a small gap, not a huge one.

3. **Or use content-based positioning**: If you're using heightOfString for text overlap fix, the content has a known bottom. Use that + padding for the CTA bar y.

4. **Ensure no overlap**: The CTA bar must not overlap the cards. Leave 20–40pt gap.

5. **Run and check**: Generate PDF, open it, verify the gap is gone.

## Rules

- One commit after changes
- Conventional commit: `fix: remove big gap on cover page of marketing PDF`
- Update docs/working-memory/open/tt-marketing-pdf-fix-cover-gap-20260224/updates.md
