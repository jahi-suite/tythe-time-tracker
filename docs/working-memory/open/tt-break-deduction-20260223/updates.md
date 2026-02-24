# Updates: tt-break-deduction-20260223

## Progress

- Rule updated to majority-based deduction. Previous progress may need revision.
- break-01 complete: Updated Python `apply_break_deduction` in `export_functions.py` to deduct 20 minutes from the majority bucket (`Standard`/`Enhanced`/`Supervisor`) for 6h+ shifts, with `Standard` as tie-break and no negative hours.
- break-02 complete: Python integration is in place for break deduction at `calculate_staff_summary` and direct `split_shift_by_rate` display/export call sites (`export_functions.py`, personal timesheet, manager dashboard, export preview UI), so per-shift and aggregated hours use deducted values consistently.
- break-03 complete: Added `applyBreakDeduction` in `tt-ts/src/server/services/exportUtils.ts` with majority-bucket deduction (Standard tie-break), and applied it in `calculateStaffSummary` plus Excel/PDF per-shift export displays in `tt-ts/src/server/services/exportService.ts`.
- break-04 complete: Added Python unit tests for break deduction scenarios in `tests/unit/test_shift_splitting.py` covering 6h threshold, pure Standard/Enhanced/Supervisor shifts, mixed majority Std/Enh, 5h no-change, and Standard tie-break on 3h+3h. Local execution is blocked in this shell because `pytest` is not installed (`python3 -m pytest` -> `No module named pytest`).
