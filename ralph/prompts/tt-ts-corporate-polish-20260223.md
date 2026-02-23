You are a Ralph Wiggum execution agent polishing the tt-ts app for a corporate, trustworthy look. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read:
- `docs/working-memory/open/tt-ts-corporate-polish-20260223/plan.md`
- `docs/working-memory/open/tt-ts-corporate-polish-20260223/updates.md`
- `tt-ts/src/client/pages/Layout.tsx`
- `tt-ts/src/client/index.css`
- `tythe_time_tracker/ui/app.py` (lines 44–95) — reference for Streamlit corporate palette

## Task

Implement the **next uncompleted story** from the plan. Do ONE story per iteration.

**Check updates.md** to see what's done. Pick the next polish-XX story in order (polish-01, polish-02, polish-03, polish-04, polish-05).

**Reference:**
- polish-01: Header with Tythe logo, "Employee Portal — The Tythe Barn", corporate blues. Relocate Pay Rate info.
- polish-02: Replace sidebar dropdown with vertical link list. Active state. Min 44px tap targets on mobile.
- polish-03: `.message-success`, `.message-error`, `.message-info` CSS. Apply to ClockPage, etc.
- polish-04: Form inputs: light bg, dark text, clear borders. First Setup page: hero block like LoginPage.
- polish-05: Cards (shadow/border, 10px radius). Tables (header #f4f7fb). Mobile responsive.

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: `feat(tt-ts):` or `style(tt-ts):` for polish
- Do NOT modify tythe_time_tracker/ or app.py — only tt-ts/.
- Update `docs/working-memory/open/tt-ts-corporate-polish-20260223/updates.md` when done.
