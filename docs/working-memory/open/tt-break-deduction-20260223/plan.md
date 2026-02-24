# Task: tt-break-deduction-20260223

> Created: 2026-02-23 | Status: in progress

## Goal

Implement a 20-minute unpaid break deduction for shifts of 6+ hours. The break is always taken before Enhanced hours, so we never deduct from Enhanced pay. Handle mixed shifts (Standard + Enhanced) and Supervisor shifts correctly.

## Business Rules

- **Threshold**: Shifts of 6 hours or more get a 20-minute unpaid break deducted.
- **Deduction source**: Always deduct from Standard hours first. Never deduct from Enhanced hours.
- **Mixed shifts** (e.g. 4h Standard + 3h Enhanced = 7h total): Deduct 20min from Standard only. Enhanced stays unchanged.
- **Pure Enhanced** (e.g. 7PM–3AM, 8h): No Standard to deduct from. No deduction (we do not reduce Enhanced pay).
- **Pure Standard** (e.g. 9AM–5PM, 8h): Deduct 20min from Standard → 7.67h paid.
- **Supervisor shifts**: Deduct 20min from Supervisor hours for 6h+ supervisor-only shifts.
- **Per-shift**: Each shift is evaluated independently. A 7h shift gets one 20min deduction. Multiple short shifts in a day do not trigger a break.
- **Edge case**: If Standard is less than 20min (e.g. 0.25h Standard + 6h Enhanced), deduct only what Standard has; do not touch Enhanced.

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

1. **break-01** — Add apply_break_deduction in Python (export_functions.py). Takes Standard, Enhanced, Supervisor dict, returns adjusted split. Logic: if total < 6 return unchanged; deduct 20/60 from Standard first; if remainder, deduct from Supervisor; never from Enhanced. Round to 2 decimals.
2. **break-02** — Integrate break deduction into Python call sites: calculate_staff_summary (apply after each split_shift_by_rate), and any direct uses of split in export/timesheet/manager UI.
3. **break-03** — Add applyBreakDeduction in TypeScript (exportUtils.ts). Same logic. Integrate into calculateStaffSummary and per-shift display in exportService.ts.
4. **break-04** — Add unit tests (Python): 6h pure Standard → 5.67h; 7h mixed (4 Std + 3 Enh) → 3.67 Std, 3 Enh; 8h pure Enhanced → no change; 5h → no change; 6h Supervisor → 5.67h Supervisor.
5. **break-05** — Verification: grep for apply_break_deduction/applyBreakDeduction; tt-ts build passes; Python tests pass.

## Verification

```bash
./ralph/verify-tt-break-deduction.sh
```
