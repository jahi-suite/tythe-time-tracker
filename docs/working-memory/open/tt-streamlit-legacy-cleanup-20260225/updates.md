# tt-streamlit-legacy-cleanup-20260225 — Updates

> Ralph implements one story per iteration. Log progress here.

## Progress

- 2026-02-25: Task created. Ralph to implement.
- 2026-02-25 16:42: legacy-01 removed example credentials from UI and docs, replaced with placeholders.
- 2026-02-25 16:45: legacy-02 removed Streamlit from `core/services.py`, injected `changed_by` from manager UI for audited shift add/edit/delete operations, and fixed `StaffSummary`/`OverallSummary` field mismatches plus frozen dataclass summary mutation.
- 2026-02-25 16:47: legacy-03 moved Streamlit secrets parsing out of `config/settings.py` into lazy-loaded `config/streamlit_secrets.py`, preserving `get_database_config()`/`get_app_config()` env fallback behavior without importing Streamlit in core config paths.
