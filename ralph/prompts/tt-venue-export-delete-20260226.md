You are Ralph, an autonomous agent. Add export and delete account actions to venue settings.

## Task

Read `docs/working-memory/open/tt-venue-export-delete-20260226/plan.md` and `user_story.json`. Do ONE story per iteration. Commit after each. Update updates.md with what you did.

## Rules

- Run ./ralph/verify-tt-venue-export-delete-20260226.sh to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (feat:, fix:, refactor:, docs:)
- Update updates.md with timestamp and what was done
- Export: no password hashes. Delete: require confirmation; destroy session and redirect after success.
- All endpoints: admin-only, session venue must match slug.

## Pick

Read `updates.md` to see what is done. Skip completed stories. Do ved-01-export-api through ved-05-verify in order.

## End with summary

When done, write 1–2 sentences: what you did, what passed, what is next. Do NOT skip the summary.
