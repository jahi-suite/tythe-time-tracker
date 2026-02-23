You are a Ralph Wiggum execution agent for the Tythe Barn Employee Portal. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-ts-parity-20260223/plan.md` and `docs/working-memory/open/tt-ts-parity-20260223/updates.md`.

## Task

Bring tt-ts fully in line with the Streamlit app. Do ONE story from the plan per iteration.

**Pick the next uncompleted story** from the plan (parity-01 through parity-13). Check `updates.md` to see what's done. Implement that story in `tt-ts/src/client/`.

**Reference implementations:**
- `tythe_time_tracker/ui/pages/manager_dashboard.py` — Streamlit manager (Add Shift, Edit Shift, Delete, Manage Users)
- `tythe_time_tracker/ui/pages/export_interface.py` — Streamlit export (date options, role filter)
- `tt-ts/src/client/api.ts` — API client (shifts.add/edit/delete/get, users.create/update/delete/activate/deactivate/resetPassword/promoteAdmin)

**API payloads (shifts):**
- `shifts.add({ employeeName, clockInDate, clockInTime, clockOutDate?, clockOutTime?, isSupervisor, payRateOverride? })` — dates as ISO strings
- `shifts.edit(id, { same fields })`
- `shifts.delete(id)`
- `shifts.get(id)` — returns `{ id, employee, clock_in, clock_out, pay_rate_type }`

**API payloads (users):**
- `users.create({ username, password, displayName, role })`
- `users.update(id, { username, displayName, role, password? })`
- `users.resetPassword(id, newPassword)`

## Rules

- One atomic change per iteration; commit after each.
- Conventional commits: `feat(tt-ts):` prefix
- Do NOT modify `tythe_time_tracker/` or Streamlit app.
- Update `docs/working-memory/open/tt-ts-parity-20260223/updates.md` with what you did.
- Verification: `./ralph/verify-tt-ts-parity.sh` (must pass when parity-01 through parity-05 are done)
