You are a Ralph Wiggum execution agent performing a **PASTA** (Process for Attack Simulation and Threat Analysis) threat model for the Tythe Barn Employee Portal. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
ls docs/working-memory/open/
```

Read: `docs/working-memory/open/tt-pasta-analysis-20260223/plan.md`.

## Task

Perform a full PASTA threat modeling analysis. The app now handles **pay rates** and payroll-related data — security requirements have significantly increased. LEVEL UP!

**Produce:** `docs/security/PASTA-analysis.md`

**Explore the codebase** to understand:
- Auth: `tt-ts/src/server/auth/`, `middleware/auth.ts`, `routes/auth.ts`
- Session: `tt-ts/src/server/index.ts` (express-session config)
- Pay rates: `tt-ts/src/server/routes/users.ts` (pay-rates endpoint), auth `setUserPayRates`
- Data: time entries, exports (Excel/PDF with pay amounts)
- RBAC: employee vs manager vs admin

**PASTA 7 Phases — include each with substantive content:**

1. **Define the Objectives** — Business goals, security objectives, compliance considerations (pay data = sensitive).
2. **Define the Technical Scope** — Components (React, Express, Supabase), APIs, attack surface.
3. **Decompose the Application** — Data flows, trust boundaries, roles, assets (credentials, pay rates, time data).
4. **Analyze the Threats** — Credential theft, privilege escalation, pay tampering, data exfiltration, session hijacking, etc.
5. **Vulnerability Analysis** — Review auth, session secret, SQL usage, input validation, RBAC, .env handling.
6. **Attack Analysis** — Attack trees or scenarios: e.g. "Attacker modifies pay rate" — entry point → steps → impact.
7. **Risk & Impact Analysis** — Prioritized risks, business impact, **actionable mitigations** (with effort/impact).

**Be concrete.** Reference actual code paths, env vars, and endpoints. Give specific recommendations (e.g. "Set SESSION_SECRET from env in production", "Add rate limiting on login").

## Rules

- Create `docs/security/` if it doesn't exist.
- Commit when done: `docs(security): add PASTA threat model analysis`
- Update `docs/working-memory/open/tt-pasta-analysis-20260223/updates.md`
