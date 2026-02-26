# Task: tt-karisuite-backend-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Refactor backend to match Kari Suite branding — simple, hard to break, operationally honest, suite-ready. No new features. No business rule changes unless fixing bugs.

## Product positioning

Kari Suite: "Small team. Real software." No roadmap theatre. Build one thing properly, ship.

## Big picture

- **Python backend** (tythe_time_tracker, export_functions): Define clean contract, centralize payroll engine, unify DB access, remove dead code, add practical logging, add regression tests.
- **tt-ts**: Already has exportUtils as payroll source of truth. Ensure no drift; do not duplicate.
- **Constraints**: No new features. No API renames without backwards compat. Incremental, reviewable commits.

## Phase 1: Backend contract

1. **backend-01** — Document the backend boundary: domain objects, services, repositories, adapters. Create docs/BACKEND_CONTRACT.md.

2. **backend-02** — Audit: Where does business logic live? Payroll, DB, Streamlit leakage. Document.

## Phase 2: Payroll engine (Python)

3. **backend-03** — Create tythe_time_tracker/core/payroll_engine.py: pure functions split_shift_by_rate, apply_break_deduction. DST (Europe/London). One source of truth.

4. **backend-04** — Migrate export_functions and services to use payroll_engine. Remove duplicated logic.

## Phase 3: Unify database access

5. **backend-05** — Single DB path. export_functions uses get_db_connection + repository. No raw psycopg2 outside connection.py.

## Phase 4: Code quality

6. **backend-06** — Remove dead code, fix circular imports, remove session state from core. Boring names.

## Phase 5: Observability

7. **backend-07** — Practical logging: imports/exports, DB errors, validation. Clear, actionable.

## Phase 6: Tests

8. **backend-08** — Add 5–10 regression tests: enhanced/standard splitting, break deduction, DST, overnight shifts.

## Phase 7: Final report

9. **backend-09** — Summary: what changed, what deleted, behaviour unchanged, tests added.

## Key paths

- tythe_time_tracker/core/ — services, models, payroll_engine
- tythe_time_tracker/database/ — connection, repository
- export_functions.py
- tests/

## Do not break

- Payroll output. Export format. Auth. tt-ts app.

## Verification

```bash
./ralph/verify-tt-karisuite-backend-20260225.sh
```
