# Updates: tt-export-manager-20260223

## 2026-02-23

- Task created. Bug: export uses manager_authenticated (never set) instead of current_user.role.
- Fixed: Added _is_manager() using current_user.role. Replaced all manager_authenticated checks. Fixed get_timesheet_data to filter by employee_name when provided (managers can export individual). Pre-fill employee name from current_user for employees.
