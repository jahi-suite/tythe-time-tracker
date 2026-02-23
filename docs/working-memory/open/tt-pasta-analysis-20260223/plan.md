# Task: tt-pasta-analysis-20260223

> Created: 2026-02-23 | Status: in progress
> Goal: PASTA threat modeling analysis — LEVEL UP security for pay-enabled app

## Summary

Adding pay rates and payroll-related data has significantly increased the security requirements of the Tythe Barn Employee Portal. Perform a full **PASTA** (Process for Attack Simulation and Threat Analysis) threat model and produce a security analysis document with prioritized mitigations.

## PASTA Phases (7)

1. **Define the Objectives (DO)** — Business objectives, security objectives, compliance (pay data = sensitive; consider GDPR, employment data).
2. **Define the Technical Scope (DT)** — System components: tt-ts (React + Express), Streamlit app, Supabase/PostgreSQL, APIs, session auth, attack surface.
3. **Decompose the Application (DA)** — Data flows, user roles (employee/manager/admin), trust boundaries, entry points, assets (credentials, pay rates, time entries, exports).
4. **Analyze the Threats (TA)** — Real-world threats: credential theft, privilege escalation, pay rate tampering, data exfiltration, session hijacking, etc.
5. **Vulnerability Analysis (VI)** — Code review: auth, session config, SQL, input validation, RBAC, secrets handling.
6. **Attack Analysis (AM)** — Attack trees: e.g. "Attacker steals pay data" — paths from entry to impact.
7. **Risk & Impact Analysis (RI)** — Prioritize risks, business impact, recommended mitigations with effort/impact.

## Output

Create `docs/security/PASTA-analysis.md` containing all 7 phases with concrete findings and actionable recommendations.

## Context

- **App:** Tythe Barn Employee Portal — time tracking + pay rates + export
- **Stack:** tt-ts (React, Express, Supabase), Streamlit (Python)
- **Sensitive data:** Passwords (bcrypt), pay rates (£/hr per user), time entries, exports with pay amounts
- **Auth:** Session-based (express-session), requireAuth/requireManager middleware
- **Key files:** tt-ts/src/server/auth/, routes/, middleware/, db/

## Verification

- `docs/security/PASTA-analysis.md` exists
- Document contains all 7 phase headings (or equivalent)
- Each phase has substantive content (not placeholder)
- Phase 7 includes prioritized mitigation list

## Rules

- One iteration may suffice; loop can run until doc is complete.
- Update `docs/working-memory/open/tt-pasta-analysis-20260223/updates.md` when done.
