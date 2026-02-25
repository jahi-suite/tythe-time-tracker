# Task: tt-break-deduction-20260223

> Created: 2026-02-23 | Status: in progress
> Updated: majority-based deduction rule

## Goal

Implement a 20-minute unpaid break deduction for shifts of 6+ hours. The break is deducted from whichever rate type makes up the **majority** of the shift (Standard, Enhanced, or Supervisor). Handle mixed shifts correctly.

## Business Rules

- **Threshold**: Shifts of 6 hours or more get a 20-minute unpaid break deducted.
- **Deduction source**: Deduct from the **majority** rate type. Whichever of Standard, Enhanced, or Supervisor has the most hours in that shift gets the 20min taken off.
- **Mixed shifts** (e.g. 4h Standard + 3h Enhanced = 7h total): Standard is majority. Deduct 20min from Standard → 3.67h Std, 3h Enh.
- **Mixed shifts** (e.g. 2h Standard + 5h Enhanced = 7h total): Enhanced is majority. Deduct 20min from Enhanced → 2h Std, 4.67h Enh.
- **Pure Standard** (e.g. 9AM–5PM, 8h): 100% Standard. Deduct 20min from Standard → 7.67h paid.
- **Pure Enhanced** (e.g. 7PM–3AM, 8h): 100% Enhanced. Deduct 20min from Enhanced → 7.67h paid.
- **Supervisor shifts**: 100% Supervisor. Deduct 20min from Supervisor → 5.67h paid (for 6h shift).
- **Per-shift**: Each shift is evaluated independently. A 7h shift gets one 20min deduction.
- **Tiebreaker**: If two rate types tie for majority (e.g. 3h Standard + 3h Enhanced), deduct from Standard. If all three are zero except one, use that one.
- **Edge case**: If the majority bucket has less than 20min (e.g. 0.25h Standard + 6h Enhanced), deduct only what that bucket has; do not go negative.

## Key Files

**Python (Streamlit):**
- export_functions.py — split_shift_by_rate, calculate_staff_summary, export_to_excel, export_to_pdf
- tythe_time_tracker/ui/pages/personal_timesheet.py — uses split for display and pay
- tythe_time_tracker/ui/pages/manager_dashboard.py — uses split for View All Entries
- tythe_time_tracker/ui/pages/export_interface.py — uses split for export

**TypeScript (tt-ts):**
- tt-ts/src/server/services/exportUtils.ts — splitShiftByRate, calculateStaffSummary
- tt-ts/src/server/services/exportService.ts — uses split for Excel/PDF

**Tests:**
- tests/unit/test_shift_splitting.py — add break deduction tests

## Stories (in order)

1. **break-01** — Add apply_break_deduction in Python (export_functions.py). Takes {Standard, Enhanced, Supervisor}, returns adjusted split. Logic: if total < 6 return unchanged; find majority (max of the three); deduct 20/60 from that bucket (or min(bucket, 20/60) if bucket is smaller). Round to 2 decimals.
2. **break-02** — Integrate break deduction into Python call sites: calculate_staff_summary (apply after each split_shift_by_rate), and any direct uses of split in export/timesheet/manager UI.
3. **break-03** — Add applyBreakDeduction in TypeScript (exportUtils.ts). Same majority-based logic. Integrate into calculateStaffSummary and per-shift display in exportService.ts.
4. **break-04** — Add unit tests (Python): 6h pure Standard → 5.67h; 7h mixed (4 Std + 3 Enh) → 3.67 Std, 3 Enh; 7h mixed (2 Std + 5 Enh) → 2 Std, 4.67 Enh; 8h pure Enhanced → 7.67h Enhanced; 5h → no change; 6h Supervisor → 5.67h Supervisor; tie (3+3) → deduct from Standard.
5. **break-05** — Verification: grep for apply_break_deduction/applyBreakDeduction; tt-ts build passes; Python tests pass.

## Verification

```bash
./ralph/verify-tt-break-deduction.sh
```
