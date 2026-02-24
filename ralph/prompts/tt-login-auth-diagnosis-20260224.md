You are a Ralph execution agent. Diagnose and fix the login/auth failure ("Unknown user", session not persisting). Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read:
- docs/working-memory/open/tt-login-auth-diagnosis-20260224/plan.md
- docs/working-memory/open/tt-login-auth-diagnosis-20260224/updates.md (if present)

## CRITICAL RULES

1. **Do NOT run verify scripts** — `./ralph/verify-*.sh` and `./tt-ts/scripts/verify-*.sh` are for the USER to run in their terminal. You create/update them but never execute them.
2. **Ralph does all coding** — implement one phase per iteration.
3. **One atomic change per iteration** — commit after each.
4. **Check updates.md** — pick the next uncompleted phase (Phase 1 through 5).

## Phases (from plan)

1. **Phase 1**: Add SESSION_STORE=pg to netlify-env.template and NETLIFY_ENV_SETUP.md
2. **Phase 2**: Await session save on login (req.session.save before res.json)
3. **Phase 3**: Replace all "Unknown user" with "User" in ClockPage, TimesheetPage, ExportPage, ManagerPage
4. **Phase 4**: (Optional) Add SESSION_DEBUG diagnostic endpoint
5. **Phase 5**: Create verify script (do not run it)

## Commit style

- feat: or fix: with conventional message
- Update docs/working-memory/open/tt-login-auth-diagnosis-20260224/updates.md when done
