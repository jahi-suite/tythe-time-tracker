# Backend Contract (Kari Suite)

Created: 2026-02-25
Scope: `tythe_time_tracker` Python backend + `export_functions.py` adapter module

## Purpose

Define the backend boundary so Kari Time can ship as one solid service surface now, with room for Kari Rota/Stock later.

Principles:

- One source of truth for payroll/time rules.
- UI calls services/adapters, not DB internals.
- Repositories own SQL for time-entry persistence.
- Core models stay framework-free (no Streamlit/session state).
- Adapters may reshape data for legacy UI compatibility.

## Layer Boundaries

## 1) Domain (pure business objects)

Files:

- `tythe_time_tracker/core/models.py`
- `tythe_time_tracker/core/constants.py`

Owns:

- `TimeEntry`, `TimeSplit`, `StaffSummary`, `OverallSummary`
- Request DTOs (`ClockInRequest`, `ClockOutRequest`, `ShiftRequest`, `ExportRequest`)
- Enums/constants (`PayRateType`, time windows, DB names, UI/export constants)

Rules:

- No DB calls.
- No Streamlit imports.
- No direct logging side effects beyond validation errors.

## 2) Services (application/business workflows)

Primary file:

- `tythe_time_tracker/core/services.py`

Supporting:

- `tythe_time_tracker/core/audit.py`
- `tythe_time_tracker/core/auth.py` (auth/user access; currently DB-facing)

Owns:

- Clock in/out workflows
- Manual shift add/edit/delete workflows
- Validation and orchestration
- Audit logging orchestration (`log_change`)

Dependencies allowed:

- Domain models/constants
- Repositories
- DB connection factory (`get_db_connection`) only for service bootstrapping
- Utility time conversion helpers (`TimeUtils`)

Must not own long-form export rendering (Excel/PDF) or UI presentation formatting.

## 3) Repositories (data access)

Files:

- `tythe_time_tracker/database/repository.py`

Owns:

- SQL for `time_entries` CRUD/query operations
- Row-to-domain mapping (`TimeEntry`)

Dependencies allowed:

- `DatabaseConnection`
- Domain models/constants
- `psycopg2` data helpers (`Json`, etc.)

Rules:

- Return domain objects (or simple primitives) to services.
- No Streamlit/session state.
- No UI tuple shaping.

## 4) DB Adapter / Infrastructure

Files:

- `tythe_time_tracker/database/connection.py`
- `tythe_time_tracker/database/init.py`
- `tythe_time_tracker/config/settings.py`

Owns:

- Connection creation (`get_db_connection`)
- Transaction/cursor lifecycle (`DatabaseConnection.get_cursor`)
- Schema init/bootstrap
- Config/secrets/env resolution

Rules:

- No payroll business logic.
- No export formatting logic.

## 5) UI/External Adapters

Files:

- `export_functions.py` (legacy export adapter for Streamlit pages)
- `tythe_time_tracker/ui/**`

Current role:

- UI-facing data shaping (legacy tuple rows)
- Export rendering (Excel/PDF)
- Date-range option helper
- Payroll/hour summary logic (currently duplicated; to be centralized later)

Contract going forward:

- UI pages should call service/adapters only.
- UI pages should not instantiate repositories or open DB connections directly.
- `export_functions.py` may remain adapter-compatible, but payroll calculation must delegate to a core engine.

## Public Backend Surface (Current, Suite-Ready Target)

Stable enough to treat as backend contract for current app:

- `TimeTrackingService` in `tythe_time_tracker/core/services.py`
- `TimeEntryRepository` in `tythe_time_tracker/database/repository.py` (internal backend API, not UI API)
- `get_db_connection()` + `DatabaseConnection` in `tythe_time_tracker/database/connection.py` (infra only)
- `export_functions.py` exported functions used by UI:
  - `get_timesheet_data`
  - `calculate_staff_summary`
  - `calculate_summary`
  - `split_shift_by_rate` (temporary location)
  - `apply_break_deduction` (temporary location)
  - `export_to_excel`
  - `export_to_pdf`

Target shape after refactor phases (no API break required):

- Payroll functions move to `tythe_time_tracker/core/payroll_engine.py`
- `export_functions.py` re-exports or delegates to payroll engine for backwards compatibility

## Dependency Map (Current)

Observed module dependency flow (high level):

- `ui/pages/*` -> `core.services.TimeTrackingService`
- `ui/pages/*` -> `export_functions.*`
- `ui/pages/manager_dashboard.py` -> `database.connection` + `database.repository` (leak)
- `export_functions.py` -> `database.connection` + `database.repository`
- `export_functions.py` -> `core.auth.get_all_users`
- `export_functions.py` -> `utils.time_utils`
- `core.services` -> `database.repository`
- `core.services` -> `database.connection`
- `core.services` -> `core.audit`
- `core.services` -> `utils.time_utils`
- `core.audit` -> `database.connection` + `database.repository`
- `database.repository` -> `core.models` + `core.constants`
- `database.connection` -> `config.settings` + `core.constants`

Allowed target dependency direction:

- `ui` -> `adapters/services`
- `adapters/services` -> `repositories` -> `db infra`
- `adapters/services/repositories` -> `core models/constants`

Avoid:

- `ui` -> `repositories/db infra`
- `db infra` -> service/business logic

## Duplicate Logic / Hotspots (Initial Map)

These are identified now to guide later stories (not changed in `backend-01`):

- Payroll split logic lives in `export_functions.py` (`split_shift_by_rate`, `apply_break_deduction`) while UI pages import and use it directly.
- `TimeTrackingService` also contains time/pay-rate determination logic, creating drift risk with export payroll calculations.
- UI manager page directly opens DB connections and repositories, bypassing service boundary.
- `export_functions.py` reshapes repository/domain data into tuple rows for legacy UI compatibility (acceptable as adapter, but should stay isolated).

## Non-Goals for This Contract

- No business rule changes.
- No API renames yet.
- No migration of payroll logic in this document-only story.

## Definition of Done for Backend Boundary

The backend matches Kari Suite expectations when:

- Domain rules live in one place.
- Services are the operational entry point.
- Repositories are the only SQL owners.
- DB setup/connection code is infra only.
- UI pages do not bypass the backend boundary.
