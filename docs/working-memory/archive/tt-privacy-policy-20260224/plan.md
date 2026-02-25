# Task: tt-privacy-policy-20260224

> Draft Privacy Policy for Kari Time, add /privacy route and page, link from marketing footer.

## Goal

1. **Draft Privacy Policy** — UK GDPR–appropriate text for Kari Time (hospitality shift-tracking SaaS). Must cover: what personal data is collected (staff names, roles, clock times, pay rates), why it is collected (payroll, timesheets, compliance), how long it is kept, who can access it (venue managers, staff), data retention and deletion, third parties (e.g. hosting), user rights (access, correction, deletion).
2. **Add `/privacy` route** — New `PrivacyPage.tsx` component, route in App.tsx for both logged-out and logged-in users.
3. **Link from marketing footer** — Add "Privacy" link in kari-time-marketing.html footer (next to Terms).

## Key Files

- tt-ts/src/client/pages/PrivacyPage.tsx (create)
- tt-ts/src/client/App.tsx (add route)
- tt-ts/public/kari-time-marketing.html (add footer link)

## Verification

```bash
./ralph/verify-tt-privacy-policy-20260224.sh
```
