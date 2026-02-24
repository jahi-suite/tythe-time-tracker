# Updates: tt-break-deduction-20260223

## Progress

- [x] break-01 (Python): added `apply_break_deduction(split)` in `export_functions.py` with 6h threshold, 20-minute deduction from Standard first, fallback to Supervisor, never Enhanced, rounded to 2 decimals.
- [x] break-02 (Python): integrated `apply_break_deduction(...)` into `calculate_staff_summary` and Python per-shift display/export call sites (`export_functions.py`, personal timesheet, manager dashboard, export preview).
