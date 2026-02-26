You are Ralph, an autonomous agent. Implement the verification fallback: unverified venues can log in and use clock/timesheet, but cannot add staff or manage shifts until verified.

## Task

Read `docs/working-memory/open/tt-verification-fallback-20260226/plan.md` and `user_story.json`. Do ONE story per iteration. Commit after each. Update updates.md with what you did.

## Rules

- Run `./ralph/verify-tt-verification-fallback-20260226.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (feat:, fix:, refactor:, docs:)
- Update updates.md with timestamp and what was done
- Founder rule: Tythe Barn (slug tythebarn) is permanently exempt. Never block.
- Manager routes (users, shifts, export, audit) must enforce verification server-side. Never trust client-only checks.

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do vf-01 through vf-04 in order.
