# Spec: Pay Rates

## Overview

Three pay rate types determine how hours are billed. Rates are determined by time of day (BST) and supervisor status. Per-user rates are stored in the database and used for pay estimation.

---

## Rate types

| Type | Trigger | Hours |
|---|---|---|
| `Standard` | Default daytime | 4:00 AM – 7:00 PM BST |
| `Enhanced` | Default overnight | 7:00 PM – 4:00 AM BST |
| `Supervisor` | User checks "supervisor" on clock-in | All hours at supervisor rate |

**Timezone:** All times stored UTC. Rate boundaries calculated in BST (UTC+1 in summer, UTC+0 in winter). Use proper BST conversion; do not hardcode UTC offset.

---

## Per-user rates

Each user has optional per-user rates in £/hr:

```
users.standard_rate   DECIMAL NULL
users.enhanced_rate   DECIMAL NULL
users.supervisor_rate DECIMAL NULL
```

If a rate is NULL, pay estimation shows "N/A" for that segment.

---

## Rate calculation for a shift

Given a shift with `clock_in` and `clock_out` (UTC):

1. Convert to BST
2. If `pay_rate_type = 'Supervisor'`: all hours → supervisor
3. Otherwise, split the shift at the 7pm and 4am BST boundaries:
   - Hours between 4:00 AM and 7:00 PM BST → Standard
   - Hours between 7:00 PM and 4:00 AM BST → Enhanced
4. Apply break deduction if shift ≥ 6h (see `specs/exports.md`)
5. Multiply each segment by the corresponding per-user rate
6. Sum for estimated pay

---

## Supervisor override

- When the user checks "I am working as a supervisor" at clock-in
- All hours in the shift are billed at supervisor rate regardless of time of day
- Stored as `pay_rate_type = 'Supervisor'` in `time_entries`

---

## Rate display

- Timesheets show estimated pay per shift when rate is set
- Exports show Standard/Enhanced/Supervisor hours separately and total estimated pay
- "N/A" if per-user rate not configured

---

## Acceptance criteria

- [ ] Shifts between 4am–7pm BST default to Standard
- [ ] Shifts between 7pm–4am BST default to Enhanced
- [ ] Supervisor checkbox overrides to Supervisor rate for all hours
- [ ] Shifts spanning the 7pm/4am boundary are correctly split
- [ ] BST offset is calculated dynamically (not hardcoded)
- [ ] Per-user rates shown in Manage Users UI with £/hr label
- [ ] Estimated pay shown in timesheet when rate is configured
- [ ] "N/A" shown when rate is not configured
