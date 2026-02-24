You are a Ralph execution agent creating Terms and Conditions for Kari Time. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-terms-conditions-20260224/plan.md
- tt-ts/src/client/App.tsx
- tt-ts/public/kari-time-marketing.html (footer section)

## Task

### 1. Draft Terms and Conditions

Create UK-appropriate Terms and Conditions for Kari Time (hospitality shift-tracking SaaS). The document must cover:

- **Service description** — what Kari Time does (clock in/out, timesheets, payroll export for venues)
- **Acceptable use** — no misuse, accurate records, compliance with employment law
- **Data handling** — personal data, staff hours, how it is used and stored
- **Liability** — limitations (e.g. not liable for payroll errors from user input)
- **Termination** — how accounts can be ended
- **Governing law** — England and Wales

Use clear, readable language. This is a draft — not legal advice, but suitable for a small SaaS.

### 2. Create TermsPage.tsx

- Create `tt-ts/src/client/pages/TermsPage.tsx`
- Render the T&Cs with readable styling (prose layout, headings, sections)
- Match the app's existing design (dark theme, cream/amber accents from marketing)
- Include a link back to home/login

### 3. Add /terms route

- Add route in `tt-ts/src/client/App.tsx` for `/terms`
- Route must be available when logged out (marketing/login flow) and when logged in
- Import and use TermsPage component

### 4. Link from marketing footer

- In `tt-ts/public/kari-time-marketing.html`, add a "Terms" link in the footer
- Place it next to or near "Kari Suite" (e.g. "Terms · Kari Suite" or similar)
- Use `href="/terms"` and `target="_top"` so it works from the iframe

## Rules

- One commit after all changes
- Conventional commit: `feat: add Terms and Conditions page and route`
- Update docs/working-memory/open/tt-terms-conditions-20260224/updates.md with what you did
