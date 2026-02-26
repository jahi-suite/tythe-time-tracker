# Task: tt-pay-rates-20260223

> Created: 2026-02-23 | Status: in progress
> Stories: [user_story.json](./user_story.json)

## What and why

- **Problem:** The system tracks hours by pay rate type (Standard, Enhanced, Supervisor) but has no £/hr values. Managers cannot see pay amounts in exports or set employee wages.
- **Goal:** Add per-employee hourly pay rates, manager UI to set/edit them, and pay amounts in Excel/PDF exports and personal timesheet.

## Design

- **Storage:** Add `standard_rate`, `enhanced_rate`, `supervisor_rate` (DECIMAL(10,2) NULL) to users table.
- **Link:** Match `time_entries.employee` to `users.display_name` (case-insensitive, trimmed).
- **Currency:** GBP; format as "£X.XX" in UI/exports.

## Steps

1. **pay-rates-01** — DB schema: ALTER TABLE users in database/init.py
2. **pay-rates-02** — Auth/core: get_user_pay_rates, set_user_pay_rates; extend get_all_users
3. **pay-rates-03** — Manager UI: pay rate inputs in Manage Users tab
4. **pay-rates-04** — Export: pay amounts in Excel and PDF
5. **pay-rates-05** — Personal timesheet: estimated pay when rates set

## Key files

- `tythe_time_tracker/database/init.py` — migration
- `tythe_time_tracker/core/auth.py` — get/set rates
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — Manage Users
- `export_functions.py` — calculate_staff_summary, export_to_excel, export_to_pdf
- `tythe_time_tracker/ui/pages/personal_timesheet.py` — estimated pay
