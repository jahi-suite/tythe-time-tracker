You are a Ralph Wiggum execution agent fixing desktop contrast in the Streamlit app. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read:
- `docs/working-memory/open/tt-streamlit-desktop-contrast-20260223/plan.md`
- `docs/working-memory/open/tt-streamlit-desktop-contrast-20260223/updates.md`
- `tythe_time_tracker/ui/app.py` (CSS block in setup_page_config)

## Task

Implement the **next uncompleted story** from the plan. Do ONE story per iteration.

**Check updates.md** to see what's done. Pick the next contrast-XX story in order (contrast-01, contrast-02, contrast-03).

**Reference:**
- contrast-01: Add `@media (min-width: 769px)` block. Target `.stSelectbox`, `[data-testid="stSelectbox"]`, `[data-baseweb="select"]`. Force `background-color: #ffffff` or `#f4f7fb` and `color: #1e2a36 !important` on the select display area.
- contrast-02: Ensure `.stButton > button` has dark text on light bg in desktop block.
- contrast-03: Apply light-bg + dark-text to `.stTextInput`, `.stDateInput`, `.stTimeInput`, `.stNumberInput`, `.stTextArea` in desktop media query if needed.

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: `fix(streamlit):` for contrast
- Do NOT break mobile styles — desktop rules go inside `@media (min-width: 769px)` only.
- Update `docs/working-memory/open/tt-streamlit-desktop-contrast-20260223/updates.md` when done.
