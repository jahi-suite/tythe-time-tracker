# Task: tt-codebase-cleanup-20260225

> Created: 2026-02-25 | Status: in progress
> **Goal**: Clean up the codebase — archive stale tasks, remove orphaned Ralph artifacts, fix broken state, consolidate docs.

## Current Mess

- **46 open tasks** in `docs/working-memory/open/` — many are likely done or stale
- **1 done task** in `docs/working-memory/done/` — tt-cicd-github-gcp-20260224
- **42 prompts**, **42 loops**, **30 verify scripts** in ralph/ — many orphaned for completed tasks
- **Broken state**: `ralph/set-cloudrun-env-from-dotenv.sh` and `tt-ts/Dockerfile` deleted (git status)
- **Untracked**: `ralph/Untitled` — garbage file
- **Docs**: CICD_SETUP.md, GCP_CLOUD_RUN_SETUP.md may have conflicting or outdated info

## Stories (in order)

### Phase 1: Fix broken state

1. **cleanup-01** — Restore `ralph/set-cloudrun-env-from-dotenv.sh` if missing (used for Cloud Run env from .env). Check git history.
2. **cleanup-02** — Restore `tt-ts/Dockerfile` if missing. Root Dockerfile builds tt-ts; tt-ts/Dockerfile may exist for local/different builds. Check git.
3. **cleanup-03** — Delete `ralph/Untitled` (untracked garbage).

### Phase 2: Archive completed open tasks

4. **cleanup-04** — For each task in `docs/working-memory/open/`, check if it's done (updates.md says completed, or verify passes, or code exists). Move done tasks to `docs/working-memory/done/`. Do in batches of 5–10 per commit.
5. **cleanup-05** — Continue archiving until all completed tasks are in done/.

### Phase 3: Remove orphaned Ralph artifacts

6. **cleanup-06** — For each task in `docs/working-memory/done/`, ensure prompts/loops/verify exist or remove orphans. For tasks with no plan in open/ or done/, the prompt/loop/verify may be orphaned — list them.
7. **cleanup-07** — Remove orphaned ralph artifacts: prompts, loops, verify scripts that have no corresponding task in open/ or done/. Keep artifacts for tasks that exist in done/ (for reference).
8. **cleanup-08** — Optionally: remove prompts/loops/verify for done tasks if we want a lean ralph/ (only active-task artifacts). Or keep them for done tasks as historical reference. **Decision**: Keep for done tasks; remove only truly orphaned (task folder never existed or was deleted).

### Phase 4: Consolidate docs

9. **cleanup-09** — Review docs/CICD_SETUP.md, docs/GCP_CLOUD_RUN_SETUP.md for accuracy. Align with current setup: Cloud Run (kari-time, karitime, karisuite-site), regions (europe-west1), deploy scripts.
10. **cleanup-10** — Remove or consolidate duplicate/obsolete docs. Check README.md, STREAMLIT_CLOUD_DATABASE.md, GITHUB_LOGIN_STEPS.md — ensure they're current or archived.

### Phase 5: Final verification

11. **cleanup-11** — Run verification: `git status` clean (or known uncommitted), `ls docs/working-memory/open/` shows only active tasks, ralph/ has no orphaned files.

## Key Files

- `docs/working-memory/open/` — 46 task folders
- `docs/working-memory/done/` — archive target
- `ralph/prompts/`, `ralph/loops/`, `ralph/verify-*.sh` — artifacts to prune
- `docs/CICD_SETUP.md`, `docs/GCP_CLOUD_RUN_SETUP.md` — docs to align

## Verification

```bash
./ralph/verify-tt-codebase-cleanup-20260225.sh
```

## Notes

- Do ONE story per Ralph iteration. Commit after each.
- When archiving, move the whole task folder (plan.md, updates.md) to done/.
- Be conservative: if unsure whether a task is done, leave it in open/.
