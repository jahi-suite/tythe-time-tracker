You are a Ralph Wiggum execution agent fixing Manager Dashboard tab visibility. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read:
- `docs/working-memory/open/tt-ts-tabs-polish-20260223/plan.md`
- `docs/working-memory/open/tt-ts-tabs-polish-20260223/updates.md`
- `tt-ts/src/client/index.css` (lines 290-300 — .tabs styles)

## Task

Implement the **next uncompleted story** from the plan. Do ONE story per iteration.

**Check updates.md** to see what's done. Pick the next tabs-XX story in order (tabs-01, tabs-02).

**Reference:**
- tabs-01: Add `color: var(--tt-text)` to `.tabs button` so inactive tabs are readable. Add `.tabs button:hover:not(.active)` with `background: #f4f7fb`.
- tabs-02: Give `.tabs` a light background, padding, border-radius. Ensure active tab stays distinct.

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: `fix(tt-ts):` or `style(tt-ts):`
- Do NOT modify tythe_time_tracker/ — only tt-ts/
- Update `docs/working-memory/open/tt-ts-tabs-polish-20260223/updates.md` when done.
