# Updates: tt-break-deduction-20260223

## Progress

- Rule updated to majority-based deduction. Previous progress may need revision.
- break-03 complete: Added `applyBreakDeduction` in `tt-ts/src/server/services/exportUtils.ts` with majority-bucket deduction (Standard tie-break), and applied it in `calculateStaffSummary` plus Excel/PDF per-shift export displays in `tt-ts/src/server/services/exportService.ts`.
