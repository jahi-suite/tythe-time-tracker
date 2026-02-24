You are a Ralph execution agent doing a full RALPH loop rewrite of the marketing page. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-marketing-page-v2-20260224/plan.md
- tt-ts/src/client/pages/MarketingLandingPage.tsx (current version — you will rewrite it)

## The Brief

The current marketing page is competent but forgettable. It doesn't work hard enough. Your job: rewrite it so it feels like it was written by someone who has actually lost a timesheet at 11pm on a Saturday. Not by a marketer. Not by an AI. By someone who *got* it.

## R — Research & Reason

Rethink the audience. This isn't "venue managers" — it's the bar manager or ops lead who is also doing admin, also on the floor, also dealing with staff drama. They don't have time to read. They skim. They're tired. What does a tired, time-poor hospitality worker respond to? Words they use: "nightmare", "chaos", "I'll deal with it Monday", "whose shift was that?" Write FROM that headspace.

## A — Architect (redesign structure entirely)

Challenge every section. You MUST:

1. **Lead with the Constance story as the HERO.** First-person. Raw. Real. Scraps of paper, disputes, built it because she was fed up. This is the most human, credible thing — put it FIRST.

2. **"Day in the life without this tool"** — a narrative section that makes it uncomfortable to read because it's too accurate. 11pm wedding reception. Nobody submitted hours. Payroll Monday morning. Make them feel it.

3. **Flip the features section:** OUTCOME → "how we do it". Not "Clock in & out. One tap." Instead: "You close your laptop Friday knowing payroll is done" → here's how. Lead with the feeling, then the mechanism.

4. **Single, specific, vivid CTA** — not "Get started. No credit card." Something that doesn't sound like 4 million other sites.

5. **Consider what to REMOVE.** Less is more. One unforgettable page beats six forgettable sections.

## L — Layout & Look

- **Palette:** Push it. Late-night venue aesthetic — deep navy or near-black background, warm amber/gold accents. The feel of a bar at last orders. (You may need to add new Tailwind colors in tailwind.config.js.)

- **Visual texture:** Hand-drawn or rough-edged SVG elements. Less "startup", more "built by an actual person."

- **Constance section:** Pull-quote on a magazine cover. Not a standard testimonial card. She deserves prominence.

- **Micro-interactions:** Hover states, scroll-triggered reveals (Framer Motion), consider a clock animation in the hero.

- **Mobile:** Designed FOR mobile first. Not shrunk from desktop.

## P — Produce

Rewrite `MarketingLandingPage.tsx` from scratch. React + Vite + Tailwind + Framer Motion. Write every line of copy fresh — do NOT recycle phrases from the old version. Make bold choices. If something feels risky, do it. Hardcode everything.

## H — Harden (before you commit)

Ask yourself:
- If Constance landed on this page after a brutal Saturday night shift, would she feel understood in the first 3 seconds?
- Is there ONE sentence on this page that will stick in someone's memory tomorrow?
- Does it look like it was built by someone who actually cares, or by a template?

Fix everything that fails those tests. Then commit.

## Rules

- One commit after all changes
- Conventional commit: `feat: rewrite marketing page — Constance hero, late-night aesthetic, outcome-first`
- Update docs/working-memory/open/tt-marketing-page-v2-20260224/updates.md with what you did
- Keep the same routes: / and /login. The page must still work.
