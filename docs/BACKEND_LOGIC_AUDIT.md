# Backend Business Logic Audit (Kari Suite)

Created: 2026-02-25
Story: `backend-02`
Scope: `tythe_time_tracker` backend + `export_functions.py`

## Purpose

Audit where business logic currently lives, with focus on:

- Payroll logic ownership and duplication
- DB access ownership and leakage
- Streamlit/session-state leakage into backend layers

This is an observation document only. No behaviour changes.

## Dependency Map (Reference)

Use `docs/BACKEND_CONTRACT.md` as the source of truth for the current boundary map and target dependency direction.

Key duplicate-logic hotspots from the contract were re-checked in code and are confirmed below with file/function references.

## Findings Summary

1. Payroll logic is split across `export_functions.py`, `core/services.py`, and UI code (`manager_dashboard.py`).
2. `export_functions.py` mixes adapter responsibilities (export rendering, tuple shaping) with payroll/business calculations.
3. UI has a confirmed DB boundary leak in `manager_dashboard.py` (direct `get_db_connection` + `TimeEntryRepository` usage).
4. `core/auth.py` owns substantial SQL directly (service-ish module acting as repository for users/auth).
5. No Streamlit imports or `st.session_state` usage were found in `tythe_time_tracker/core/*` or `tythe_time_tracker/database/*` (good baseline).

## Payroll Logic Location Audit

## A) `export_functions.py` (current primary payroll split logic)

Confirmed payroll/business logic in adapter module:

- `split_shift_by_rate` in `export_functions.py:112`
  - DST-aware UK conversion via `TimeUtils.convert_to_bst`
  - Enhanced window split logic (19:00 to 04:00 BST)
  - Overnight handling
- `apply_break_deduction` in `export_functions.py:154`
  - 20-minute break rule for shifts >= 6h
  - Deducts from majority rate bucket
- `calculate_staff_summary` in `export_functions.py:203`
  - Aggregation and pay calculation (when rates are provided)
- `calculate_summary` in `export_functions.py:269`
  - Overall totals

Impact:

- This module is UI/export-facing but currently acts as payroll engine.
- Any other module implementing similar split/rate logic risks drift.

## B) `TimeTrackingService` (`core/services.py`) contains overlapping rate logic

Confirmed overlapping business logic:

- `_determine_pay_rate_type` in `tythe_time_tracker/core/services.py:535`
  - Uses BST conversion and enhanced window classification for shift rate at clock-in
- `calculate_time_split` in `tythe_time_tracker/core/services.py:431`
  - Separate time split implementation
  - Simpler logic than `export_functions.split_shift_by_rate` (clock-in-hour based, no overlap split or break deduction)
- `calculate_staff_summary` / `calculate_overall_summary` in `tythe_time_tracker/core/services.py:472` and `tythe_time_tracker/core/services.py:505`
  - Summary aggregation over service-level split logic

Drift risk:

- Service split logic and export split logic are not identical in shape/behaviour.
- `export_functions.py` handles mixed-rate overlap and break deduction; `TimeTrackingService.calculate_time_split` does not.
- This is the main refactor target for `backend-03` and `backend-04`.

## C) UI page performs payroll calculations directly

Confirmed in `tythe_time_tracker/ui/pages/manager_dashboard.py`:

- Imports payroll helpers from `export_functions.py` at `tythe_time_tracker/ui/pages/manager_dashboard.py:30`
- Computes grouped totals using `split_shift_by_rate` + `apply_break_deduction` in `show_all_entries_tab` at `tythe_time_tracker/ui/pages/manager_dashboard.py:99`
- Repeats per-shift payroll display calculations in same function at `tythe_time_tracker/ui/pages/manager_dashboard.py:115`

Impact:

- UI presentation layer is aware of payroll split internals instead of consuming a backend summary.
- Makes payroll rule changes harder to contain safely.

## DB Access Ownership Audit

## A) Good baseline (connection creation centralized)

- Direct `psycopg2.connect(...)` found only in `tythe_time_tracker/database/connection.py:27`

This means low-level DB driver calls are already centralized.

## B) Repository usage exists, but boundary is bypassed from UI

Confirmed UI DB leak in `tythe_time_tracker/ui/pages/manager_dashboard.py`:

- Direct imports of `DatabaseConnection` and `get_db_connection` at `tythe_time_tracker/ui/pages/manager_dashboard.py:26`
- Direct import of `TimeEntryRepository` at `tythe_time_tracker/ui/pages/manager_dashboard.py:27`
- `_load_audit_logs(...)` opens DB connection and instantiates repository directly at `tythe_time_tracker/ui/pages/manager_dashboard.py:645`

Impact:

- UI page bypasses service boundary for audit log data.
- Makes connection lifecycle and query ownership harder to standardize.

## C) `export_functions.py` uses repository directly (acceptable adapter, but note)

Confirmed in `export_functions.py:43`:

- `get_timesheet_data(...)` opens DB connection and queries repository directly, then reshapes data into legacy tuples.

Assessment:

- Acceptable as a legacy adapter in current architecture, but it is both data adapter and payroll engine today.
- Should remain adapter-only after payroll centralization.

## D) `core/auth.py` contains inline SQL and connection handling

Confirmed examples:

- `authenticate_user` at `tythe_time_tracker/core/auth.py:26`
- `create_user` at `tythe_time_tracker/core/auth.py:72`
- `get_all_users` at `tythe_time_tracker/core/auth.py:112`
- `get_user_pay_rates` at `tythe_time_tracker/core/auth.py:155`

Pattern:

- Functions import `DatabaseConnection`/`get_db_connection` internally and execute SQL directly.

Assessment:

- Works today, but user/auth data access is not repository-owned like `TimeEntryRepository`.
- This is a consistency gap (not necessarily a bug) to track for later cleanup.

## Streamlit / Session State Leakage Audit

## A) Confirmed no backend-layer Streamlit leakage

Checked `tythe_time_tracker/core/*`, `tythe_time_tracker/database/*`, and `export_functions.py`:

- No `import streamlit as st`
- No `st.session_state`

This is a good baseline for `backend-06` ("remove session state from core"): core appears clean already.

## B) Expected UI usage (not leakage)

Streamlit/session state usage is present in UI modules only, e.g.:

- `tythe_time_tracker/ui/app.py`
- `tythe_time_tracker/ui/pages/login.py`
- `tythe_time_tracker/ui/pages/employee_interface.py`
- `tythe_time_tracker/ui/pages/export_interface.py`
- `tythe_time_tracker/ui/pages/manager_dashboard.py`

## Duplicate Logic Map (Actionable for Next Stories)

## Duplicate / overlapping business logic

- Pay-rate window classification:
  - `tythe_time_tracker/core/services.py:_determine_pay_rate_type`
  - `export_functions.py:split_shift_by_rate`
- Shift split aggregation:
  - `tythe_time_tracker/core/services.py:calculate_time_split`
  - `export_functions.py:split_shift_by_rate`
- Staff/overall summaries:
  - `tythe_time_tracker/core/services.py:calculate_staff_summary`
  - `export_functions.py:calculate_staff_summary`
  - `export_functions.py:calculate_summary`
- UI re-computation of payroll display totals:
  - `tythe_time_tracker/ui/pages/manager_dashboard.py:show_all_entries_tab`

## Suggested refactor sequence (matches plan)

- `backend-03`: create pure payroll engine in `tythe_time_tracker/core/payroll_engine.py`
- `backend-04`: delegate service/export/UI calculations to payroll engine (keep adapter compatibility)
- `backend-05`: move remaining UI DB reads behind service/adapters where practical

## Non-Changes Made

- No code paths changed
- No business rules changed
- No API changes
