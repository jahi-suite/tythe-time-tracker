You are a Ralph execution agent updating the marketing landing page copy. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-marketing-content-20260224/plan.md
- tt-ts/src/client/pages/MarketingLandingPage.tsx

## Task

Update MarketingLandingPage.tsx with these three changes:

### 1. Origin Story

Add that Employee Portal was **made by the Bar Manager (Constance)** because she was fed up of:
- Scraps of paper going missing
- Disputes with staff on pay and rates

Weave this into the hero subhead, or add a short "Made by someone who gets it" / "Built from the bar" section. Be creative but keep it concise.

### 2. Pay Rates Copy

Update the "Pay rates, automatic" feature card (and any related copy) to emphasize:
- **Custom pay rates** can be added
- **Enhanced rates** (e.g. night premium)
- **Custom day/night rates** — configurable per venue

Current text: "Standard, enhanced (night), supervisor. Set once, calculated forever." — expand to mention custom rates, day/night, enhanced.

### 3. Testimonials

- **Remove** the fake testimonials (Sarah Mitchell, James Chen)
- **Add** one real testimonial from **Constance, Tythe Barn Bar Manager**

Suggested testimonial (you may refine the tone but keep it authentic):

> "I built this because I was sick of scraps of paper going missing and endless disputes with staff over hours and rates. Now we clock in, set our custom day and night rates, and export. No more arguments — it's all there."

— **Constance**, Tythe Barn Bar Manager

Replace the testimonials array with a single testimonial object for Constance. Adjust the section layout if needed (e.g. single testimonial can be centered).

## Rules

- One commit after all changes
- Conventional commit: `feat: update marketing copy with origin story and Constance testimonial`
- Update docs/working-memory/open/tt-marketing-content-20260224/updates.md with what you did
