# Updates: tt-export-break-and-shift-validation-20260223

## Progress

- [x] break-clarity-01 — Python Excel export: added `Break Deducted` column on Staff Hours & Shifts rows and footer note explaining 20-minute unpaid break rule for 6h+ shifts.

## Log

- 2026-02-23: Plan created. Part A: break clarity in exports. Part B: add shift validation (existing user, case-insensitive).
- 2026-02-24: Completed `break-clarity-01` in `export_functions.py` (Python Excel hierarchical export only). Shift rows now show `20 min` for gross 6h+ shifts, otherwise `—`, and the Staff Hours & Shifts sheet includes a break deduction note.
