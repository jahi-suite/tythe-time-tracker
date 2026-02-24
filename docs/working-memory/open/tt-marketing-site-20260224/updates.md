# Updates

## 2026-02-24

### RALPH loop completed

**R — Research & Reason:** Documented in RESEARCH.md. Target: venue managers, pain points (paper timesheets, payroll chaos), emotion: relief and trust.

**A — Architect:** Documented in ARCHITECTURE.md. Sections: Hero, Pain Point, Features, How It Works, Testimonials, CTA, Footer.

**L — Layout & Look:** Documented in LAYOUT.md. Palette: barn greens, tan, cream, charcoal. Typography: Fraunces + Source Sans 3.

**P — Produce:** Built marketing landing page as `MarketingLandingPage.tsx`. Integrated into tt-ts app:
- `/` = marketing landing (when not logged in)
- `/login` = login page
- Added Tailwind CSS v3, Framer Motion, lucide-react
- Fraunces + Source Sans 3 via Google Fonts

**H — Harden & Hotfix:**
- Mobile: smaller hero text (text-3xl on mobile), tighter padding, full-width CTA on mobile
- Pain point bullets: softer × icon instead of red !
- Typographic quotes in testimonials
- "Back to home" link on login page
- Tailwind preflight disabled to preserve existing app styles
