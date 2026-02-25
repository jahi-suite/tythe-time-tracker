# Task: tt-archive-obsolete-tasks-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Archive open Ralph tasks that are obsolete — app is on Google Cloud Run, Netlify and some compatibility tasks are no longer needed.

## Context

- App is deployed on **Google Cloud Run** (tt-ts). Netlify is not used.
- App is currently functioning.
- Many open tasks in `docs/working-memory/open/` are obsolete: Netlify deployment, Netlify debugging, Netlify-focused auth diagnosis, Streamlit-specific fixes (if tt-ts is primary).

## Tasks to Archive (move open/ → done/)

### Phase 1: Netlify (obsolete — app on GCP)

1. **archive-01** — Move `tt-netlify-fullstack-20260224` to `docs/working-memory/done/`. Add `obsolete: Netlify not used; app on Google Cloud Run` to done folder (e.g. in plan.md or a note file).
2. **archive-02** — Move `tt-netlify-502-debug-20260224` to done/ (obsolete).
3. **archive-03** — Move `tt-netlify-login-debug-20260224` to done/ (obsolete).

### Phase 2: Netlify-focused auth (app works)

4. **archive-04** — Move `tt-login-auth-diagnosis-20260224` to done/. Plan was Netlify-focused; app is working on GCP.

### Phase 3: Streamlit-specific (optional — if tt-ts is primary)

5. **archive-05** — Move `tt-streamlit-desktop-contrast-20260223` to done/ if Streamlit is legacy and tt-ts is the primary app. If unsure, leave open.

### Phase 4: Orphaned / empty tasks

6. **archive-06** — For any task in open/ that has no plan.md or is clearly abandoned, move to done/ with note "archived: no plan or abandoned".

## Rules

- One task folder per commit (or small batches of related tasks).
- Conventional commits: `chore: archive obsolete tt-netlify-fullstack to done`
- Add a brief note in the done folder: `obsolete: reason` or `archived: reason`.
- Do NOT delete prompts/loops/verify — keep them for done tasks (they may be useful reference).

## Verification

```bash
./ralph/verify-tt-archive-obsolete-tasks-20260225.sh
```

## Key Paths

- `docs/working-memory/open/` — source
- `docs/working-memory/done/` — destination
