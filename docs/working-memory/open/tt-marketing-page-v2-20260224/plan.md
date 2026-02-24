# Task: tt-marketing-page-v2-20260224

> Full RALPH loop rewrite of the marketing page. Make it feel written by someone who lost a timesheet at 11pm on a Saturday.

## Goal

Rewrite `tt-ts/src/client/pages/MarketingLandingPage.tsx` from scratch. The current version is competent but forgettable. This version must feel human, specific, and unforgettable.

## What's Wrong (Current)

- Copy is clean but not sticky. No tension. No "I feel seen."
- Pain section lists problems but doesn't make you *feel* the 11pm wedding chaos.
- Constance origin story is gold but buried. Should be the HERO.
- Structure is predictable: hero → pain → features → how it works → testimonial → CTA. Every SaaS does this.
- Features read like a spec sheet. No feeling.
- CTA is invisible ("Get started. No credit card." — 4 million sites).
- Kari Suite footer unexplained — mean something or remove it.

## RALPH Loop Requirements

### R — Research & Reason
- Audience: bar manager or ops lead doing admin, on the floor, dealing with staff drama.
- They don't have time to read. They skim. They're tired.
- Words they use: "nightmare", "chaos", "I'll deal with it Monday", "whose shift was that?"
- Write FROM that headspace.

### A — Architect (redesign structure)
- Lead with Constance story as HERO. First-person. Raw. Real.
- "Day in the life without this tool" — make it uncomfortable because it's too accurate.
- Flip features: OUTCOME → "how we do it". ("You close your laptop Friday knowing payroll is done" → here's how)
- Single, specific, vivid CTA. Not generic SaaS.
- Consider what to REMOVE. Less is more. One unforgettable page beats six forgettable sections.

### L — Layout & Look
- Push the palette: late-night venue aesthetic — deep navy or near-black, warm amber/gold accents. Bar at last orders.
- Hand-drawn or rough-edged SVG elements. Less "startup", more "built by an actual person."
- Constance section: pull-quote on a magazine cover, not a standard testimonial card.
- Micro-interactions: hover states, scroll-triggered reveals, clock animation in hero.
- Mobile: designed FOR mobile, not shrunk from desktop.

### P — Produce
- React + Vite + Tailwind + Framer Motion.
- Write every line of copy fresh. No recycling.
- Bold choices. If it feels risky, do it.
- Hardcode everything. No CMS.

### H — Harden (before done)
- Would Constance feel understood in 3 seconds after a brutal Saturday shift?
- Is there ONE sentence that sticks in memory tomorrow?
- Does it look built by someone who cares, or by a template?
- Fix everything that fails.

## Key File

- tt-ts/src/client/pages/MarketingLandingPage.tsx

## Verification

```bash
./ralph/verify-tt-marketing-page-v2-20260224.sh
```
