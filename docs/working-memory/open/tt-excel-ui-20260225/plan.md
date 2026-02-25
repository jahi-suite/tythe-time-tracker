# Task: tt-excel-ui-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Make Excel timesheet exports look professional and readable — like an actual table with clear UI. No business logic changes. Presentation only.

## What and why

- **Current:** Plain Excel export — no styling, no borders, no column widths. Hard to scan.
- **Target:** Professional table appearance: styled header row, sensible column widths, borders, readable layout.
- **Why:** Payroll exports should look credible and easy to read for managers and accountants.

## Non-goals

- Do not change business logic, calculations, or data structure.
- Do not change PDF export (separate task if needed).
- Do not change Python export_functions.py (tt-ts is the primary app).

## Current stack

- **tt-ts/src/server/services/exportService.ts** — `exportToExcel()` uses ExcelJS
- ExcelJS supports: `cell.font`, `cell.fill`, `cell.border`, `worksheet.columns[].width`
- Sheets: "Staff Hours & Shifts", "Overall Summary"

## Key paths

- tt-ts/src/server/services/exportService.ts

## Stories (order matters)

1. **excel-ui-01** — Header row: bold font, subtle background fill, bottom border. Apply to column headers on Staff Hours & Shifts.
2. **excel-ui-02** — Column widths: set sensible widths for each column so content fits (e.g. Staff Name 18, Date 12, Clock-In/Out 10, Hours 10, Pay 12).
3. **excel-ui-03** — Cell borders: add thin borders to data cells so the sheet reads as a table. Header row + data rows.
4. **excel-ui-04** — Overall Summary sheet: style header row, add borders, column width. Match Staff sheet styling where appropriate.
5. **excel-ui-05** — Optional polish: alternate row shading for shift rows within each employee block, or subtle separator between employees. Keep it readable, not noisy.

## Verification

```bash
cd tt-ts && npm run build
# Manual: export Excel, open in Excel/LibreOffice, verify styling
```

## Affected files

- tt-ts/src/server/services/exportService.ts
