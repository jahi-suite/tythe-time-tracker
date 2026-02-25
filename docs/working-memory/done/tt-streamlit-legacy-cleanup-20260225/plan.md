# Task: tt-streamlit-legacy-cleanup-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Remove legacy Streamlit Time architecture. Consolidate into single clean service/repository + DB access pattern. No new features. No behaviour changes unless fixing bugs.

## Big picture

- **Context**: This codebase had a Streamlit-based time tracking app. tt-ts (TypeScript) is now primary on Cloud Run. The Python Streamlit app remains for some deployments. We must clean up the Python codebase: remove Streamlit from core logic, unify DB access, fix dataclass mismatches, eliminate secrets exposure.
- **Scope**: Python codebase only (`tythe_time_tracker/`, `export_functions.py`, `app.py`, `config/`). Do NOT touch tt-ts.
- **Constraints**: No new features. No business logic changes unless fixing clear bugs. No schema changes. No new frameworks. Minimal but correct changes.

## Phase 1: Secrets exposure

1. **legacy-01** — Audit for secrets exposure:
   - Grep for hardcoded passwords, real credentials, `st.secrets` in UI-rendered paths
   - Check `tythe_time_tracker/ui/app.py` for any expander/block that renders example secrets (e.g. the `'''[SUPABASE]'''` block around line 264)
   - Replace with placeholders. Remove UI elements that could expose real credentials.
   - Ensure no real credentials appear anywhere in committed code.

## Phase 2: Core services and Streamlit

2. **legacy-02** — Refactor `core/services.py`:
   - Remove `import streamlit as st`
   - Replace `_get_audit_username()` with dependency injection: accept `changed_by: str` or a callable `get_audit_username: Callable[[], str]` in methods that need it
   - Callers (UI pages) pass `st.session_state.get("current_user", {}).get("username", "")` when invoking service methods
   - Fix dataclass mismatches: `StaffSummary` has `employee` not `employee_name`; `OverallSummary` has `staff_summaries` not `staff_summary`. Align services.py with models.py
   - Ensure no mutation of frozen dataclasses

3. **legacy-03** — Refactor `config/settings.py`:
   - Move Streamlit secrets loading behind a lazy/optional import: only import streamlit when `from_streamlit_secrets` is actually called
   - Ensure `get_database_config()` can work from env without Streamlit (already has fallback to `from_env()`)
   - Consider: split `from_streamlit_secrets` into a separate module that UI imports, so core can run without Streamlit

4. **legacy-04** — Refactor `database/init.py`:
   - `_get_seed_credentials()` imports streamlit. Move to a UI-only helper or make the import conditional/lazy
   - Ensure `initialize_database()` and table creation do not require Streamlit when using env config

## Phase 3: Unify database access

5. **legacy-05** — Refactor `export_functions.py`:
   - Remove direct `psycopg2.connect()` and `st.secrets` usage
   - Use `get_db_connection()` from `tythe_time_tracker.database.connection` (which uses `get_database_config()`)
   - Use `TimeEntryRepository` or equivalent for data access instead of raw SQL
   - Preserve Supabase pooler compatibility (options, sslmode as in connection.py)
   - Keep export logic (Excel, PDF, hours calculation) intact — only change how data is fetched

6. **legacy-06** — Audit all DB access:
   - Grep for `psycopg2.connect` outside `database/connection.py`
   - Ensure all DB access flows through `get_db_connection()` or `DatabaseConnection`/`TimeEntryRepository`
   - Document any remaining direct connects with justification

## Phase 4: Streamlit isolation

7. **legacy-07** — Restrict Streamlit to UI:
   - Grep for `import streamlit` and `st.session_state` outside `tythe_time_tracker/ui/`
   - Refactor so only `ui/` imports Streamlit
   - Core modules (`core/`, `database/`, `utils/`) receive values as arguments; no st.*
   - Verify: `python -c "from tythe_time_tracker.core.services import TimeTrackingService"` works without Streamlit installed (or with mock)

## Phase 5: Dead code purge

8. **legacy-08** — Identify and remove dead code:
   - Unused modules (no imports)
   - Unused imports
   - Orphaned files from old Streamlit Time
   - Remove only after confirming no references (grep, import graph)
   - Ensure project still runs after removal

## Phase 6: Stability verification

9. **legacy-09** — Final verification:
   - App boots without legacy import errors
   - No circular imports
   - No mutation of frozen dataclasses
   - No duplicated DB connection logic
   - No secrets printed or exposed
   - Exports still compute: standard hours, enhanced hours, supervisor hours, break deduction
   - DST handling intact
   - Run tests: `pytest tests/` if available

## Key paths

- `tythe_time_tracker/core/services.py` — remove Streamlit, fix dataclass usage, DI for audit username
- `tythe_time_tracker/core/models.py` — source of truth for dataclass fields
- `tythe_time_tracker/config/settings.py` — lazy/optional Streamlit import
- `tythe_time_tracker/database/connection.py` — single DB connection utility
- `tythe_time_tracker/database/init.py` — seed credentials without pulling Streamlit into init
- `export_functions.py` — use repository, not direct psycopg2
- `tythe_time_tracker/ui/` — only place that imports Streamlit

## Do not break

- Payroll/export behaviour (hours, rates, break deduction)
- Login, auth, session
- Manager dashboard, employee interface, timesheet, export UI
- Database schema
- tt-ts (TypeScript app)

## Verification

```bash
./ralph/verify-tt-streamlit-legacy-cleanup-20260225.sh
```
