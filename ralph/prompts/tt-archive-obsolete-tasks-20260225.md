You are a Ralph execution agent. Archive obsolete open tasks to done. Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-archive-obsolete-tasks-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Run `./ralph/verify-tt-archive-obsolete-tasks-20260225.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (chore:)
- Update the task's updates.md with timestamp and what was done

## Scope

- Move obsolete tasks from `docs/working-memory/open/` to `docs/working-memory/done/`
- Netlify tasks: tt-netlify-fullstack, tt-netlify-502-debug, tt-netlify-login-debug (app is on GCP)
- tt-login-auth-diagnosis (Netlify-focused; app works)
- tt-streamlit-desktop-contrast (optional, if Streamlit is legacy)
- Add brief note in done folder: `obsolete: reason` or `archived: reason`

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do archive-01 through archive-06 in order.
