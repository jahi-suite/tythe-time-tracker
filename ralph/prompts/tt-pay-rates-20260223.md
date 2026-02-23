You are a Ralph Wiggum execution agent for the Employee Portal (The Tythe Barn). Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-pay-rates-20260223/plan.md`, `docs/working-memory/open/tt-pay-rates-20260223/updates.md`, and `docs/working-memory/open/tt-pay-rates-20260223/user_story.json`.

## Current story

**Story ID: {{STORY_ID}}**

Implement the pay rates feature per the plan. Add per-employee hourly pay rates (Standard, Enhanced, Supervisor), manager UI to set/edit them, and pay amounts in exports and personal timesheet.

Key files:
- `tythe_time_tracker/database/init.py` — ALTER TABLE users for standard_rate, enhanced_rate, supervisor_rate
- `tythe_time_tracker/core/auth.py` — get_user_pay_rates, set_user_pay_rates, extend get_all_users
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — Manage Users: pay rate inputs
- `export_functions.py` — calculate_staff_summary, export_to_excel, export_to_pdf
- `tythe_time_tracker/ui/pages/personal_timesheet.py` — estimated pay

## Task

1. If the story is already implemented and verified, set `"passes": true` in user_story.json, commit, and stop.
2. Implement the current story per its acceptance criteria.
3. Commit with prefix: `feat(pay-rates):` or `fix(pay-rates):` as appropriate.
4. Update updates.md. STOP.

## Rules

- Match time_entries.employee to users.display_name (case-insensitive, trimmed).
- NULL rates = show "—" or 0 in exports.
- Format currency as "£X.XX" in UI/exports.
