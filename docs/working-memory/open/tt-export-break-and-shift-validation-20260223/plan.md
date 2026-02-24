# Task: tt-export-break-and-shift-validation-20260223

> Created: 2026-02-23 | Status: open
> Grand plan: export break clarity + add shift validation

## Goal

Two improvements:

1. **Export break clarity** — The 20-minute unpaid break for 6h+ shifts is already deducted from pay, but it's not visible in exports. Make it explicit so users can see what was deducted.
2. **Add shift validation** — When adding (or editing) shifts manually, validate that the employee name matches an existing user. Use case-insensitive matching and store the canonical display_name.

---

## Part A: Export Break Clarity

### Current state

- Break deduction is applied: `apply_break_deduction` (Python) and `applyBreakDeduction` (TypeScript) deduct 20 minutes from the majority rate for shifts of 6+ hours.
- Exports show **post-deduction** hours (Standard, Enhanced, Supervisor, Total Hours, Total Pay).
- There is **no column or note** indicating that a break was deducted. Users cannot tell from the export whether a break was applied or how it affected pay.

### Desired state

- **Per-shift rows**: Add a "Break Deducted" column. For shifts of 6+ hours: show "20 min" (or "0.33 h"). For shorter shifts: show "—" or blank.
- **Summary/footer**: Add a note explaining the rule, e.g. "20 minutes unpaid break deducted for shifts of 6+ hours (deducted from majority rate type)."
- **Both implementations**: Python (export_functions.py, Streamlit export UI) and TypeScript (tt-ts exportService.ts).

### Stories (Part A)

1. **break-clarity-01** — Python Excel: Add "Break Deducted" column to the hierarchical export. For each shift, compute gross hours (before deduction); if ≥ 6h, show "20 min"; else "—". Add footer/note on the Staff Hours & Shifts sheet explaining the rule.
2. **break-clarity-02** — Python PDF: Same "Break Deducted" column and explanatory note in the PDF export.
3. **break-clarity-03** — TypeScript Excel: Add "Break Deducted" column and footer note in tt-ts exportService.ts exportToExcel.
4. **break-clarity-04** — TypeScript PDF: Same in exportToPdf.
5. **break-clarity-05** — Verification: grep for "Break Deducted" or "break" in export headers; manual spot-check that exports include the column and note.

---

## Part B: Add Shift Validation (Existing User, Case-Insensitive)

### Current state

- Add Shift (and Edit Shift) accept any free-text employee name.
- Names are stored as entered. No validation against the `users` table.
- Typos or non-existent names create orphaned entries (e.g. "james" vs "James" vs "jim").
- Pay rates and user lookup use `display_name`; mismatched names cause pay to show as "—".

### Desired state

- **Validation**: Before creating or updating a time entry, check that the employee name matches an existing user's `display_name` (case-insensitive).
- **Canonical storage**: When saving, use the **canonical** display_name from the DB (e.g. user typed "james", DB has "James" → store "James").
- **Error message**: If no match: "Employee 'X' not found. Please use a name from the user list." (or similar).
- **Both implementations**: Python (tythe_time_tracker/core/services.py) and TypeScript (tt-ts timeTracking.ts, shifts route).

### Stories (Part B)

1. **shift-val-01** — Python: In `add_shift_manually_with_request` and `edit_shift`, validate employee name against users table (case-insensitive match on display_name). If no match, return `(False, "Employee 'X' not found. Please use a name from the user list.")`. On success, use the canonical display_name from the matched user when creating/updating the time entry. Auth module has `get_all_users`; filter active users.
2. **shift-val-02** — TypeScript: In `addShift` and `editShift` (timeTracking.ts), validate employee name against `getAllUsers()` (case-insensitive match on display_name). If no match, return `[false, "Employee 'X' not found. Please use a name from the user list."]`. Use canonical display_name when calling repo.
3. **shift-val-03** — UI improvement (optional): In tt-ts ManagerPage Add Shift form, consider a dropdown or autocomplete of existing display names instead of free text. If keeping free text, ensure server validation is the source of truth.
4. **shift-val-04** — Verification: Add a test or manual check that adding a shift with "nonexistent" fails; adding with "james" when user is "James" succeeds and stores "James".

---

## Key Files

**Export (break clarity):**
- export_functions.py — export_to_excel, export_to_pdf, hierarchical_data
- tythe_time_tracker/ui/pages/export_interface.py
- tt-ts/src/server/services/exportService.ts — exportToExcel, exportToPdf
- tt-ts/src/server/services/exportUtils.ts — applyBreakDeduction, splitShiftByRate

**Add/Edit shift (validation):**
- tythe_time_tracker/core/services.py — add_shift_manually_with_request, edit_shift
- tythe_time_tracker/core/auth.py — get_all_users
- tt-ts/src/server/services/timeTracking.ts — addShift, editShift
- tt-ts/src/server/auth/index.ts — getAllUsers
- tt-ts/src/client/pages/ManagerPage.tsx — Add Shift form

---

## Execution Order

Ralph should implement in this order:

1. break-clarity-01 through break-clarity-05
2. shift-val-01 through shift-val-04

Or run as two separate loops if preferred (one for Part A, one for Part B).

---

## Verification

```bash
# Part A: break clarity
grep -E "Break Deducted|break.*deduct" export_functions.py tt-ts/src/server/services/exportService.ts

# Part B: shift validation
# Manual: add shift with "nonexistent" → error
# Manual: add shift with "james" when user is "James" → success, stores "James"
```
