# Spec: Time Entries

## Overview

Core time-tracking functionality. Employees clock in and clock out. Shifts are stored as `time_entries` rows.

---

## Data model

```
time_entries
├── id           UUID PK
├── employee     TEXT  -- display_name of user who clocked in
├── clock_in     TIMESTAMPTZ (UTC)
├── clock_out    TIMESTAMPTZ (UTC, NULL = shift open)
├── pay_rate_type TEXT  -- "Standard" | "Enhanced" | "Supervisor"
├── venue_id     UUID NULL FK → venues
└── created_at   TIMESTAMPTZ
```

---

## Clock in

1. User selects pay rate type (Standard, Enhanced, or Supervisor checkbox)
2. `pay_rate_type` is determined:
   - If user checks "Supervisor": `Supervisor`
   - Otherwise, based on current time (BST): Standard (4am–7pm) or Enhanced (7pm–4am)
3. Insert row: `employee = current_user.display_name`, `clock_in = now() UTC`, `clock_out = NULL`
4. UI shows the open shift

**Constraint:** A user cannot have two open shifts simultaneously. If an open shift exists, block clock-in.

---

## Clock out

1. Find the open shift for `current_user.display_name`
2. Set `clock_out = now() UTC`
3. UI shows shift summary (duration, rate)

---

## View timesheet (personal)

- Filter by `employee = current_user.display_name`
- Optional date range filter
- Show: date, clock-in, clock-out, duration, pay rate type, estimated pay (if rate set)
- Summary row: total hours, total estimated pay

---

## Manager: view all entries

- All entries across all employees
- Group by employee
- Date range filter
- Quick export button

---

## Manager: add shift

- Select employee (by display name), clock-in datetime, clock-out datetime, pay rate type
- Validates: clock-out > clock-in

---

## Manager: edit shift

- Select entry by ID or from list
- Edit: clock-in, clock-out, pay rate type
- Validates: clock-out > clock-in
- Writes to audit log

---

## Manager: delete entry

- Select entry
- Confirm deletion
- Writes to audit log

---

## Acceptance criteria

- [ ] Employee can clock in; open shift is visible in UI
- [ ] Employee cannot clock in if a shift is already open
- [ ] Employee can clock out; shift shows correct duration
- [ ] Personal timesheet shows only own entries, filtered by date range
- [ ] Manager can view all entries, grouped by employee
- [ ] Manager can add, edit, and delete shifts
- [ ] All manager edits/deletes are recorded in audit log
