You are a Ralph execution agent. Fix contact email and Kari Suite links across the entire codebase. Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-karisuite-contact-links-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Run `./ralph/verify-tt-karisuite-contact-links-20260225.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (fix:, chore:)
- Update the task's updates.md with timestamp and what was done
- **Look at the bigger picture**: Grep the ENTIRE repo for hello@, mailto:, href.*karisuite, href.*time\.karisuite. Don't miss karisuite-site or any docs.

## Big picture

- Contact: jahi@karisuite.com everywhere. No hello@.
- Powered by Kari Suite: links to https://karisuite.com. Never to time.karisuite.com.
- time.karisuite.com = app. karisuite.com = main site. Use correctly.

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do karisuite-01 through karisuite-06 in order.
