# tt-streamlit-legacy-cleanup-20260225 — Updates

> Ralph implements one story per iteration. Log progress here.

## Progress

- 2026-02-25: Task created. Ralph to implement.
- 2026-02-25 16:42: legacy-01 removed example credentials from UI and docs, replaced with placeholders.
- 2026-02-25 16:45: legacy-02 removed Streamlit from `core/services.py`, injected `changed_by` from manager UI for audited shift add/edit/delete operations, and fixed `StaffSummary`/`OverallSummary` field mismatches plus frozen dataclass summary mutation.
- 2026-02-25 16:47: legacy-03 moved Streamlit secrets parsing out of `config/settings.py` into lazy-loaded `config/streamlit_secrets.py`, preserving `get_database_config()`/`get_app_config()` env fallback behavior without importing Streamlit in core config paths.
- 2026-02-25 16:48: legacy-04 removed direct Streamlit import from `database/init.py` by lazily delegating seed credential lookup to `config/streamlit_secrets.py`, preserving env-first seeding and database initialization behavior.
- 2026-02-25 16:50: legacy-05 refactored `export_functions.get_timesheet_data()` to use `get_db_connection()` + `DatabaseConnection` + `TimeEntryRepository` instead of `st.secrets`/direct `psycopg2.connect`, while preserving legacy tuple return shape and sort order for export UI callers.
- 2026-02-25 16:51: legacy-06 audited DB access across Python code (`rg` for `psycopg2.connect` and connection imports/usages); confirmed direct connects now exist only in `tythe_time_tracker/database/connection.py` and all other callers use `get_db_connection()` / `DatabaseConnection` / repository layer (no extra exceptions to document).
- 2026-02-25 16:54: legacy-07 moved Streamlit-backed secrets readers into `tythe_time_tracker/ui/secrets_provider.py` so only `ui/` imports Streamlit, updated `config/settings.py` and `database/init.py` to use the UI adapter lazily, and fixed the Ralph verifier's Streamlit grep to ignore binary `__pycache__` files (false positives on `.pyc`).
