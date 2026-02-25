# Task: tt-contact-kari-links-20260225

> Created: 2026-02-25 | Status: open
> **Goal**: Set contact email to jahi@karisuite.com and make all "Powered by Kari Suite" clickable, linking to the main site in a new tab.

## Big picture

- **Contact**: Users need a clear way to reach support. The email jahi@karisuite.com should appear wherever we say "contact us" or "support" or "privacy queries".
- **Powered by Kari Suite**: This is branding that should drive traffic to the main Kari Suite website. Every instance must be a link to https://karisuite.com, opening in a new tab (target="_blank" rel="noopener noreferrer").
- **Where to look**: Marketing landing, privacy policy, terms, Layout footer, any other public-facing pages. Grep for "Powered by", "Kari Suite", "contact", "support" to find all touchpoints.

## Stories (one per iteration)

### Phase 1: Contact email

1. **links-01** — Add/update contact email jahi@karisuite.com:
   - Privacy policy: Contact & Complaints section — include mailto:jahi@karisuite.com. Update "Contact the venue directly, or use the support link" to mention the email.
   - Marketing footer: add "Contact us" link with mailto:jahi@karisuite.com if not present.
   - Any other contact/support references — ensure jahi@karisuite.com is the canonical contact.

### Phase 2: Powered by Kari Suite links

2. **links-02** — Marketing page (kari-time-marketing.html): "Powered by Kari Suite" must be `<a href="https://karisuite.com" target="_blank" rel="noopener noreferrer">Kari Suite</a>`. Not href="#" or href="/".

3. **links-03** — Privacy policy footer: "Powered by Kari Suite" — same link, new tab.

4. **links-04** — Layout footer (app footer when logged in): "Powered by Kari Suite" is currently a span. Make it a link to https://karisuite.com, target="_blank". Add CSS so the link inherits footer styling (color, no default blue).

### Phase 3: Verification

5. **links-05** — Verify: build passes. Grep confirms jahi@karisuite.com in privacy + marketing. Grep confirms all "Kari Suite" / "Powered by" are links to https://karisuite.com with target="_blank".

## Key paths

- `tt-ts/public/kari-time-marketing.html` — marketing footer
- `tt-ts/public/privacy-policy.html` — contact section, footer
- `tt-ts/src/client/pages/Layout.tsx` — app footer
- `tt-ts/src/client/index.css` — footer link styling

## Do not break

- Terms, Privacy, marketing page layout and styling
- Existing nav links (Log in, Terms, Privacy)

## Verification

```bash
./ralph/verify-tt-contact-kari-links-20260225.sh
```
