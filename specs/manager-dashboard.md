# Spec: Manager Dashboard

## Overview

The manager dashboard is the admin interface for managing time entries, users, and audit history. Accessible to `manager` and `admin` roles only.

---

## Tabs

### 1. View All Entries

- Show all time entries across all employees
- Group by employee name
- Date range filter (default: current week)
- Quick export button (Excel) for visible range
- Sortable columns: date, duration

### 2. Add Shift

- Form: Employee (dropdown of active users), Clock In (datetime), Clock Out (datetime), Pay Rate Type
- Validation: clock-out must be after clock-in
- On submit: insert row, write to audit log

### 3. Edit Shift

- Select entry (from list or by ID)
- Pre-populate form with current values
- Edit: clock-in, clock-out, pay rate type
- Validation: clock-out must be after clock-in
- On submit: update row, write to audit log

### 4. Delete Entry

- Select entry from list
- Confirm deletion
- On confirm: delete row, write to audit log

### 5. Manage Users

- List all users (active + inactive) with:
  - Display name, username, role, active status
  - Per-user pay rates (Standard / Enhanced / Supervisor £/hr)
  - Actions: Edit, Activate/Deactivate
- **Create user:** username, display name, password, role (`employee` | `manager` | `admin`)
- **Edit user:** display name, role, pay rates
- **Activate/Deactivate:** toggle `active` flag; cannot deactivate self
- **Promote to admin:** admin-only; promotes manager to admin
- **Per-user rates:** inline edit Standard/Enhanced/Supervisor £/hr

### 6. Audit Log

- Chronological list of all manager actions
- Columns: timestamp, action, performed by, target (entry/user), details
- Filterable by date range and actor

---

## Access control

- All tabs require `role` in `['manager', 'admin']`
- "Promote to admin" requires `role = 'admin'`
- Manager cannot modify own role
- Manager cannot deactivate self

---

## Acceptance criteria

- [ ] Dashboard inaccessible to `employee` role (403)
- [ ] View All Entries shows all entries, grouped by employee, with date range filter
- [ ] Add Shift creates a valid entry and logs to audit log
- [ ] Edit Shift updates entry and logs to audit log
- [ ] Delete Entry removes entry and logs to audit log
- [ ] Manage Users lists all users with pay rates
- [ ] Manager can create, edit, activate/deactivate users
- [ ] Manager cannot deactivate self
- [ ] Admin can promote manager to admin
- [ ] Audit Log shows all manager actions with correct details
