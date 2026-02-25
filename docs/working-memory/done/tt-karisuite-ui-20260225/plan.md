# Task: tt-karisuite-ui-20260225

> Created: 2026-02-25 | Status: done
> **Goal**: Reskin and restructure the tt-ts app UI to match the look/feel of KariSuite.com. Minimal, confident typography. Lots of whitespace. Centered max-width layout. Product sibling, not admin panel.

## Product positioning (KariSuite.com)

- "Small team. Real software."
- No roadmap theatre. Build tight. Ship it.
- Reference: https://karisuite.com and tt-ts/public/kari-time-marketing.html

## Non-goals

- Do not change backend business logic.
- Do not change auth rules or data models.
- **Do not change HTML pages** (tt-ts/public/*.html, karisuite-site/*.html). MarketingLandingPage must use iframe to kari-time-marketing.html — do not replace with React.
- Only touch presentation + lightweight routing/layout where needed.
- Keep changes incremental and reviewable.

## Current stack

- **tt-ts**: React, Vite, Tailwind, react-router-dom
- **Pages**: MarketingLandingPage (iframe to kari-time-marketing.html), VenueLandingPage, LoginPage, Layout (Clock, Timesheet, Export, Manager, VenueSettings), Terms, Privacy, DevVenues
- **Styles**: tt-ts/src/client/index.css (Tailwind + custom vars: --tt-primary, --tt-spacing-*, etc.)
- **Layout**: Layout.tsx with sidebar nav, header, main, footer

## Key paths

- tt-ts/src/client/pages/ — all page components
- tt-ts/src/client/index.css — global styles
- tt-ts/public/kari-time-marketing.html — reference for Kari look/feel (dark theme, DM Sans, Playfair Display, amber accents)

## Stories (order matters)

1. **ui-tokens** — Design tokens: --maxWidth, spacing scale, font sizes, border radius, button/link/tag styles. styles/tokens.css + theme.css. No page-level random CSS.
2. **ui-components** — Reusable components: TopNav, Container, Hero, Section, Card, Tag chips, Steps, Footer. Pages compose these.
3. **ui-shell** — App shell layout: TopNav on every page, consistent spacing, mobile-friendly. Dashboard feels like product sibling.
4. **ui-landing** — Landing screen: Hero, three-value bullets, Products section (Live/Idea/Radar), How we work 1/2/3, CTA. Or logged-out welcome.
5. **ui-copy** — Copy/tone pass: short, direct, no fluff. Match site voice ("No roadmap theatre.", "Build tight. Ship it.").
6. **ui-qa** — QA: no layout shift, no horizontal scroll on mobile, semantic headings, focus states, pages still function.

## Verification

```bash
cd tt-ts && npm run build
# Plus: grep for tokens, components exist, etc. (see verify script if created)
```

## Affected files (expected)

- tt-ts/src/client/styles/ (new: tokens, theme)
- tt-ts/src/client/components/ (new: TopNav, Container, Hero, Section, Card, Tag, Steps, Footer)
- tt-ts/src/client/pages/Layout.tsx
- tt-ts/src/client/pages/MarketingLandingPage.tsx (or replace iframe with React landing)
- tt-ts/src/client/index.css
- tt-ts/index.html (fonts if needed)
