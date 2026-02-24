# Updates: tt-break-deduction-20260223

## Progress

- Rule updated to majority-based deduction. Previous progress may need revision.
- break-01 complete: Updated Python `apply_break_deduction` in `export_functions.py` to deduct 20 minutes from the majority bucket (`Standard`/`Enhanced`/`Supervisor`) for 6h+ shifts, with `Standard` as tie-break and no negative hours.
- break-03 complete: Added `applyBreakDeduction` in `tt-ts/src/server/services/exportUtils.ts` with majority-bucket deduction (Standard tie-break), and applied it in `calculateStaffSummary` plus Excel/PDF per-shift export displays in `tt-ts/src/server/services/exportService.ts`.
