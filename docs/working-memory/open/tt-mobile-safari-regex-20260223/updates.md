## 2026-02-23

- Task created. Goal: mitigate mobile Safari regex crash (SyntaxError: invalid group specifier name).
- `safari-regex-01` implemented: bumped `requirements.txt` from `streamlit>=1.32.0` to `streamlit>=1.39.0` (local `.venv` currently has Streamlit `1.54.0`).
- Verification: `.venv/bin/python -m py_compile app.py tythe_time_tracker/ui/app.py` passed; import smoke (`import streamlit, tythe_time_tracker.ui.app`) passed.
- Runtime note: full `streamlit run` startup could not be completed in this sandbox because socket bind is blocked (`PermissionError: [Errno 1] Operation not permitted`).
