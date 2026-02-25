# Task: tt-terms-conditions-20260224

> Draft Terms and Conditions for Kari Time, add /terms route and page, link from marketing footer.

## Goal

1. **Draft Terms and Conditions** — UK-appropriate legal text for Kari Time (hospitality shift-tracking SaaS). Must cover: service description, acceptable use, data handling, liability, termination, governing law (England & Wales).
2. **Add `/terms` route** — New `TermsPage.tsx` component, route in App.tsx for both logged-out and logged-in users.
3. **Link from marketing footer** — Add "Terms" link in kari-time-marketing.html footer (next to "Kari Suite").

## Key Files

- tt-ts/src/client/pages/TermsPage.tsx (create)
- tt-ts/src/client/App.tsx (add route)
- tt-ts/public/kari-time-marketing.html (add footer link)

## Verification

```bash
./ralph/verify-tt-terms-conditions-20260224.sh
```
