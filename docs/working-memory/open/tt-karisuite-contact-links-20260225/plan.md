# Task: tt-karisuite-contact-links-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Fix contact email (jahi@karisuite.com) and "Powered by Kari Suite" links (→ karisuite.com) across the entire codebase. Big-picture audit so nothing is missed.

## Big picture

- **Contact email**: Canonical contact is jahi@karisuite.com. Replace hello@karisuite.com everywhere.
- **Powered by Kari Suite**: Must link to https://karisuite.com (main site). Must NOT link to time.karisuite.com (that's the app).
- **Scope**: tt-ts (Kari Time app), karisuite-site (main karisuite.com site), any docs or config. Grep the whole repo.
- **URL roles**: time.karisuite.com = Kari Time app. karisuite.com = main Kari Suite site. "Try Kari Time" → time.karisuite.com. "Powered by Kari Suite" / "Kari Suite" brand → karisuite.com.

## Audit checklist (Ralph must verify)

Before and after: grep for:
- `hello@` — must be zero (all → jahi@)
- `mailto:.*@karisuite` — all must be jahi@karisuite.com
- `Powered by.*Kari Suite` — link must be https://karisuite.com
- `href=.*time\.karisuite` — only for "Try Kari Time" / app links, never for "Powered by"
- Any `href="/"` or `href="#"` on "Kari Suite" / "Powered by" — must be https://karisuite.com

## Stories (one per iteration)

### Phase 1: Contact email

1. **karisuite-01** — karisuite-site: Replace hello@karisuite.com with jahi@karisuite.com:
   - karisuite-site/index.html (footer, CTA "Get in touch")
   - karisuite-site/privacy.html (contact section)
   - Grep entire repo for hello@ — fix any remaining

2. **karisuite-02** — tt-ts: Confirm jahi@karisuite.com everywhere. Grep for any hello@ or wrong contact. Fix if found.

### Phase 2: Powered by / Kari Suite links

3. **karisuite-03** — tt-ts: Ensure "Powered by Kari Suite" links to https://karisuite.com:
   - Layout.tsx footer
   - kari-time-marketing.html footer
   - privacy-policy.html footer
   - No href="/" or href="#" or time.karisuite.com for this link

4. **karisuite-04** — karisuite-site: Footer has "Kari Time" (→ time.karisuite.com — correct) and contact (→ jahi@). Add "Powered by Kari Suite" if missing, or ensure any Kari Suite brand link goes to karisuite.com. Main site is karisuite.com so "Powered by" might not appear there; but any link to "Kari Suite" main site should be karisuite.com.

5. **karisuite-05** — Full audit: Grep for `href=.*karisuite`, `href=.*time\.`, `mailto:.*karisuite`. Document each. Ensure no "Powered by" or main-site link goes to time.karisuite.com.

### Phase 3: Verification

6. **karisuite-06** — Verify: No hello@ in repo. All contact links jahi@karisuite.com. All "Powered by Kari Suite" / Kari Suite brand links → https://karisuite.com. Build passes.

## Key paths

- `tt-ts/public/kari-time-marketing.html`
- `tt-ts/public/privacy-policy.html`
- `tt-ts/src/client/pages/Layout.tsx`
- `karisuite-site/index.html`
- `karisuite-site/privacy.html`
- Any docs or config with contact URLs

## Do not break

- "Try Kari Time" / app links → time.karisuite.com (correct)
- Terms, Privacy, marketing page layout

## Verification

```bash
./ralph/verify-tt-karisuite-contact-links-20260225.sh
```
