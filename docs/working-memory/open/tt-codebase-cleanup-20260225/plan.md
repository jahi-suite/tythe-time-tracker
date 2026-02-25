# Task: tt-codebase-cleanup-20260225

> Created: 2026-02-25 | Status: in progress
> **Goal**: Clean up the **whole codebase** — Ralph artifacts, root cruft, docs, dead code. Use Ralph to do it.

## Current Mess

**Ralph & working memory:**
- 46 open tasks in `docs/working-memory/open/` — many done or stale
- 42 prompts, 42 loops, 30 verify scripts — many orphaned
- ralph/Untitled, missing set-cloudrun-env-from-dotenv.sh (if deleted)

**Root-level cruft:**
- debug_env.py, debug_shift.py, check_gitignore.py, test_connection.py, update_database.py — one-off scripts?
- farm-scaled.jpg (95KB) — unused image?
- google-cloud-cli-linux-x86_64.tar.gz, google-cloud-sdk/ — in .gitignore but may be committed; remove if tracked
- .coverage, coverage.xml, htmlcov/ — in .gitignore; ensure not committed

**Docs:**
- README.md, STREAMLIT_CLOUD_DATABASE.md, GITHUB_LOGIN_STEPS.md, SUPABASE_SETUP.md, claude.md — consolidate, remove obsolete
- docs/CICD_SETUP.md, docs/GCP_CLOUD_RUN_SETUP.md — align with current Cloud Run setup

**Code:**
- Python: tythe_time_tracker/, app.py, export_functions.py — dead code, unused imports?
- tt-ts/: dead code, unused imports?

## Stories (in order)

### Phase 1: Fix broken state

1. **cleanup-01** — Restore ralph/set-cloudrun-env-from-dotenv.sh if missing. Delete ralph/Untitled.

### Phase 2: Root-level cruft

2. **cleanup-02** — Remove or archive one-off scripts: debug_env.py, debug_shift.py, check_gitignore.py, test_connection.py, update_database.py. Only remove if confirmed unused (grep for imports).
3. **cleanup-03** — Remove farm-scaled.jpg if unused. Check if google-cloud-cli*.tar.gz or google-cloud-sdk are tracked; add to .gitignore if missing, remove from repo if committed.
4. **cleanup-04** — Ensure coverage.xml, htmlcov, .coverage are in .gitignore and not committed.

### Phase 3: Archive completed open tasks

5. **cleanup-05** — For each task in docs/working-memory/open/, check if done. Move done tasks to done/. Batches of 5–10 per commit.
6. **cleanup-06** — Continue archiving until open count < 20.

### Phase 4: Remove orphaned Ralph artifacts

7. **cleanup-07** — Remove prompts/loops/verify that have no task in open/ or done/. Keep for done tasks.

### Phase 5: Consolidate docs

8. **cleanup-08** — Align docs/CICD_SETUP.md, docs/GCP_CLOUD_RUN_SETUP.md with current setup (kari-time, karitime, karisuite-site, europe-west1).
9. **cleanup-09** — Consolidate root docs: README, STREAMLIT_CLOUD_DATABASE, GITHUB_LOGIN_STEPS, SUPABASE_SETUP. Move obsolete to docs/archive/ or remove.
10. **cleanup-10** — Remove duplicate/obsolete docs (e.g. docs/streamlit-secrets-example.toml vs secrets-to-paste-in-streamlit.toml).

### Phase 6: Code cleanup (optional, conservative)

11. **cleanup-11** — Python: remove unused imports (e.g. ruff check --select I). Do not remove "dead" code unless clearly unused.
12. **cleanup-12** — tt-ts: remove unused imports. Run tsc --noEmit, npm run build to verify.

### Phase 7: Final verification

13. **cleanup-13** — Run verify script. git status clean. No large files in repo.

## Key Paths

- Root: app.py, export_functions.py, debug_*.py, *.md
- docs/, ralph/, docs/working-memory/
- tt-ts/, tythe_time_tracker/

## Verification

```bash
./ralph/verify-tt-codebase-cleanup-20260225.sh
```

## Notes

- Do ONE story per Ralph iteration. Commit after each.
- Be conservative: if unsure, leave it. Grep before removing.
