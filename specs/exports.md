# Spec: Exports

## Overview

Employees and managers can export timesheets as Excel (.xlsx) or PDF. Exports include pay calculation and break deductions.

---

## Export parameters

| Parameter | Employee | Manager |
|---|---|---|
| Date range (from/to) | ✓ | ✓ |
| Employee filter | Own only | Any or all |
| Format | Excel, PDF | Excel, PDF |

---

## Break deduction rule

- Shifts **≥ 6 hours** (360 minutes) → deduct **20 minutes** unpaid break
- Deduct from the segment with the **most minutes** (Standard, Enhanced, or Supervisor)
- Tie: deduct from Standard
- TypeScript: `src/server/exportUtils.ts` → `applyBreakDeduction`

---

## Pay calculation

For each shift:
1. Split hours by rate type (Standard = 4am–7pm BST, Enhanced = 7pm–4am BST, Supervisor = all hours)
2. Apply break deduction if ≥ 6 hours
3. Multiply by per-user rate (from `users` table); show "N/A" if rate not set

Summary row: total hours per rate type, total estimated pay.

---

## Excel export

- One sheet per employee (or single sheet if one employee selected)
- Columns: Date, Clock In, Clock Out, Duration, Rate Type, Standard Hours, Enhanced Hours, Supervisor Hours, Break Deducted, Estimated Pay
- Summary row at bottom

---

## PDF export

- Header: "The Tythe Barn — Timesheet"
- Employee name, date range
- Table: same columns as Excel
- Summary row
- Page numbers

---

## Acceptance criteria

- [ ] Employee can export own timesheet as Excel and PDF
- [ ] Manager can export any employee's timesheet or all employees
- [ ] Break deduction is applied to shifts ≥ 6 hours
- [ ] Break is deducted from the majority-hours segment
- [ ] Estimated pay shown when per-user rate is set; "N/A" otherwise
- [ ] Excel file downloads correctly in browser
- [ ] PDF file downloads correctly in browser
