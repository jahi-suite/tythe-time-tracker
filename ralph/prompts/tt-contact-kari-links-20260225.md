You are a Ralph execution agent. Add contact email and fix Powered by Kari Suite links. Fresh context — everything you need is on disk.

## Task

Read `docs/working-memory/open/tt-contact-kari-links-20260225/plan.md`. Do **ONE story** per iteration. Commit after each. Update `updates.md` with what you did.

## Rules

- Run `./ralph/verify-tt-contact-kari-links-20260225.sh` to see current state
- Do ONE atomic unit of work (one story from the plan)
- Commit immediately with conventional prefix (feat:, fix:, chore:)
- Update the task's updates.md with timestamp and what was done
- **Look at the bigger picture**: Grep for "Powered by", "Kari Suite", "contact", "support" across the codebase. Don't miss any page.

## Big picture

- Contact: jahi@karisuite.com everywhere we say contact/support
- Powered by Kari Suite: every instance links to https://karisuite.com, opens in new tab
- Check marketing, privacy, terms, Layout, any other public pages

## Pick

Read `updates.md` to see what's done. Skip completed stories. Do links-01 through links-05 in order.
