You are a Ralph execution agent creating a Privacy Policy for Kari Time. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
```

Read:
- docs/working-memory/open/tt-privacy-policy-20260224/plan.md
- tt-ts/src/client/App.tsx
- tt-ts/src/client/pages/TermsPage.tsx (for styling reference)
- tt-ts/public/kari-time-marketing.html (footer section)

## Task

### 1. Draft Privacy Policy

Create UK GDPR–appropriate Privacy Policy text for Kari Time (hospitality shift-tracking SaaS). The document must cover:

- **What we collect** — staff names, roles, clock-in/out times, pay rates, venue info
- **Why we collect it** — payroll, timesheets, compliance, audit trail
- **How long we keep it** — retention period (e.g. as required for payroll or until account deleted)
- **Who can access it** — venue managers, staff (their own data), you as service provider
- **Data retention and deletion** — what happens when an account is closed
- **Third parties** — hosting, any subprocessors (if none, say data is stored securely and not shared)
- **Your rights** — access, correction, deletion, complaint to ICO (UK)

Use clear, readable language. This is a draft — not legal advice, but suitable for a small SaaS.

### 2. Create PrivacyPage.tsx

- Create `tt-ts/src/client/pages/PrivacyPage.tsx`
- Render the Privacy Policy with readable styling (prose layout, headings, sections)
- Match TermsPage styling (dark theme, cream/amber accents)
- Include a link back to home/login

### 3. Add /privacy route

- Add route in `tt-ts/src/client/App.tsx` for `/privacy`
- Route must be available when logged out (marketing/login flow) and when logged in
- Import and use PrivacyPage component

### 4. Link from marketing footer

- In `tt-ts/public/kari-time-marketing.html`, add a "Privacy" link in the footer
- Place it next to or near "Terms" (e.g. "Terms · Privacy · Kari Suite" or similar)
- Use `href="/privacy"` and `target="_top"` so it works from the iframe

## Rules

- One commit after all changes
- Conventional commit: `feat: add Privacy Policy page and route`
- Update docs/working-memory/open/tt-privacy-policy-20260224/updates.md with what you did
