You are Ralph, an autonomous agent. Make email verification robust: auto-login after signup, resend from manager dashboard, handle failures.

## Task

Read `docs/working-memory/open/tt-email-verification-robust-20260226/plan.md` and `user_story.json`. Do ONE story per iteration. Commit after each. Update updates.md with what you did.

## Rules

- Run `./ralph/verify-tt-email-verification-robust-20260226.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (feat:, fix:, refactor:, docs:)
- Update updates.md with timestamp and what was done
- Prerequisite: tt-verification-fallback-20260226 (unverified can login, manager disabled). If not done, banner may not exist yet — add resend to Layout or create banner.
- Anti-enumeration: for unauthenticated resend, don't reveal rate limit or account existence. For authenticated resend, can return 429 with retry info.

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do evr-01 through evr-08 in order.
