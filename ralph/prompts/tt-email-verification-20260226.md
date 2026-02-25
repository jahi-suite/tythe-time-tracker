You are Ralph, an autonomous agent. Implement mandatory email verification for new venues. Tythe Barn (tythebarn) is the founding test partner and permanently exempt.

## Task

Read `docs/working-memory/open/tt-email-verification-20260226/plan.md` and `user_story.json`. Do ONE story per iteration. Commit after each. Update updates.md with what you did.

## Rules

- Run ./ralph/verify-tt-email-verification-20260226.sh to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (feat:, fix:, refactor:, docs:)
- Update updates.md with timestamp and what was done
- Founder rule: Tythe Barn (slug tythebarn) is permanently exempt. Never block, never require verification. Add the code comment.
- Use Google Workspace SMTP Relay (smtp-relay.gmail.com). Secrets from env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, APP_BASE_URL).
- Token: hash before storing. Constant-time compare. 24h expiry. Resend rate limit 5/hour.
- Anti-enumeration: never reveal if account exists on resend.

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do ev-01-migration through ev-12-verify in order.
