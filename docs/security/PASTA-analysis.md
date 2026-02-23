# Tythe Barn Employee Portal PASTA Threat Model (Pay-Enabled)

Date: 2026-02-23
Scope reviewed: `tt-ts` React + Express app and server-side payroll/time-tracking flows

This analysis follows PASTA (7 phases) and reflects the increased sensitivity introduced by pay rates and payroll-calculated exports.

## 1. Define the Objectives (DO)

### Business goals
- Provide an employee portal for clock-in/out, timesheets, shift management, and exports.
- Support manager/admin operations (user management, shift corrections, exports, audit viewing).
- Support payroll-adjacent workflows by storing per-user pay rates and generating exports with pay amounts.

### Security objectives
- Preserve confidentiality of pay rates and payroll totals.
- Preserve integrity of time entries, pay-rate assignments, and user roles.
- Prevent unauthorized access to employee/manager/admin functions.
- Ensure accountability for payroll-relevant changes (who changed what, when).
- Maintain availability during payroll/export periods (login and export endpoints are operationally critical).

### Compliance / legal / privacy considerations (practical)
- Pay rates and payroll totals are sensitive employment data (confidential HR/payroll information).
- Time entries + identities + pay can become personal data under GDPR/UK GDPR style handling obligations.
- Need auditable change history for payroll-impacting events (pay-rate updates, password resets, role changes, user activation/deactivation).
- Principle of least privilege is more important now that managers/admins can access payroll data.

## 2. Define the Technical Scope (DT)

### Components in scope
- Frontend: React SPA (served statically by Express from `tt-ts/dist`) via `tt-ts/src/server/index.ts:44`.
- Backend API: Express 4 app with session auth in `tt-ts/src/server/index.ts:23`.
- Auth/RBAC logic: `tt-ts/src/server/routes/auth.ts`, `tt-ts/src/server/middleware/auth.ts`, `tt-ts/src/server/auth/index.ts`.
- Payroll-related logic:
- Pay rates storage/update via `tt-ts/src/server/routes/users.ts:78` and `tt-ts/src/server/auth/index.ts:120`.
- Payroll calculations/export via `tt-ts/src/server/services/exportUtils.ts:78` and `tt-ts/src/server/services/exportService.ts:13`.
- Data access: PostgreSQL/Supabase via `pg` in `tt-ts/src/server/db/connection.ts` and repository functions in `tt-ts/src/server/db/repository.ts`.
- Audit logs (partial coverage): `tt-ts/src/server/routes/audit.ts`, `tt-ts/src/server/audit.ts`, `tt-ts/src/server/services/timeTracking.ts:92`.

### Key APIs / attack surface
- `POST /api/auth/login` (`tt-ts/src/server/routes/auth.ts:7`)
- `POST /api/auth/change-password` (`tt-ts/src/server/routes/auth.ts:41`)
- `POST /api/auth/first-setup` (`tt-ts/src/server/routes/auth.ts:66`)
- `GET/POST/PUT/DELETE /api/users...` including `/:id/pay-rates`, `/:id/reset-password`, `/:id/promote-admin` (`tt-ts/src/server/routes/users.ts`)
- `GET /api/timesheet`, `GET /api/timesheet/all` (`tt-ts/src/server/routes/timesheet.ts`)
- `POST/PUT/DELETE /api/shifts...` (`tt-ts/src/server/routes/shifts.ts`)
- `GET /api/export/excel|pdf` (`tt-ts/src/server/routes/export.ts`)
- `GET /api/audit` (`tt-ts/src/server/routes/audit.ts`)

### Trust boundaries
- Browser <-> Express API (session cookie boundary)
- Express API <-> PostgreSQL/Supabase (DB credentials and TLS)
- Role boundary: employee vs manager vs admin
- Payroll data boundary: pay rates/pay totals should be stricter than general timesheet access

## 3. Decompose the Application (DA)

### Roles and privileges (current)
- `employee`: authenticated access to own clock/timesheet/export (`requireAuth`).
- `manager`: all `requireManager` endpoints (includes user CRUD, pay rates, reset password, audit, shifts, all timesheets).
- `admin`: same `requireManager` route access plus some admin-only checks inside service functions (e.g. admin promotion rules in `tt-ts/src/server/auth/index.ts:298`).

### Core assets
- Credentials: usernames + bcrypt hashes (`tt-ts/src/server/auth/index.ts:22`, `:232`, `:254`).
- Session state: `req.session.user` in server-side session store (`tt-ts/src/server/routes/auth.ts:18`).
- Payroll data: `standard_rate`, `enhanced_rate`, `supervisor_rate` columns (`tt-ts/src/server/auth/index.ts:77`, `:120`).
- Time entry data: employee identity, timestamps, pay rate type (`tt-ts/src/server/db/repository.ts:37`, `:173`).
- Payroll exports (Excel/PDF) with totals and pay amounts (`tt-ts/src/server/services/exportService.ts:62`, `:188`).
- Audit logs (currently focused on time entry changes) (`tt-ts/src/server/services/timeTracking.ts:92`, `:128`, `:137`).

### Data flows (simplified)
1. Login flow
- Browser sends username/password to `/api/auth/login`.
- `authenticateUser()` fetches active user and verifies bcrypt hash (`tt-ts/src/server/auth/index.ts:14`).
- Session user object is stored in session (`tt-ts/src/server/routes/auth.ts:18`).

2. Employee clock/timesheet flow
- Employee uses session-authenticated `/api/clock/*` and `/api/timesheet`.
- Server binds actions to `session.user.display_name` (`tt-ts/src/server/routes/clock.ts:12`, `:22`, `tt-ts/src/server/routes/timesheet.ts:13`).
- Repository queries time entries by `employee` string match (`tt-ts/src/server/db/repository.ts:58`, `:90`).

3. Manager/admin payroll flow
- Manager/admin uses `/api/users/:id/pay-rates` to update user rates (`tt-ts/src/server/routes/users.ts:78`).
- Server writes rate columns in `users` table (`tt-ts/src/server/auth/index.ts:127`).
- Exports pull time entries + all users + pay rates, compute pay totals by display-name key (`tt-ts/src/server/services/exportService.ts:13`, `tt-ts/src/server/services/exportUtils.ts:103`).

4. Shift management + audit
- Manager/admin modifies shifts via `/api/shifts` routes (`tt-ts/src/server/routes/shifts.ts`).
- `timeTracking` logs add/edit/delete actions to `audit_log` (`tt-ts/src/server/services/timeTracking.ts:92`, `:128`, `:137`).

### Important trust/identity design note
- Time entries and payroll rate lookup are joined by human-readable employee/display name (case-insensitive trim), not immutable user ID (`tt-ts/src/server/db/repository.ts:58`, `:90`; `tt-ts/src/server/auth/index.ts:108`; `tt-ts/src/server/services/exportService.ts:17`). This creates integrity risks if names collide or are changed.

## 4. Analyze the Threats (TA)

### Threat actors
- External attacker (internet-facing) attempting credential stuffing, session hijack, or first-setup abuse.
- Malicious/compromised employee account attempting privilege escalation or unauthorized data access.
- Malicious/compromised manager account tampering with payroll/time data or exfiltrating all pay exports.
- Insider with DB/env access extracting credentials/secrets or modifying data directly.

### Relevant threat categories (mapped to this app)
- Authentication attacks
- Brute force / credential stuffing against `POST /api/auth/login` (no rate limiting visible in `tt-ts/src/server/routes/auth.ts:7`).
- Session fixation/hijacking due to login not regenerating session ID (`tt-ts/src/server/routes/auth.ts:18`) and minimal cookie hardening (`tt-ts/src/server/index.ts:28`).

- Authorization / privilege escalation
- Manager-level access currently includes pay-rate updates and broad user management through `router.use(requireManager)` in `tt-ts/src/server/routes/users.ts:7`.
- Any manager can call `/:id/pay-rates` (`tt-ts/src/server/routes/users.ts:78`) and change payroll-affecting values.
- Any manager can deactivate users or edit user records via same route group (`tt-ts/src/server/routes/users.ts:28`, `:60`, `:69`).

- Data integrity / payroll tampering
- Unauthorized or mistaken pay-rate modification (lack of rate range/type validation in route and service: `tt-ts/src/server/routes/users.ts:79`, `tt-ts/src/server/auth/index.ts:120`).
- Shift edits with arbitrary `payRateOverride` and date parsing without enum/date validation (`tt-ts/src/server/routes/shifts.ts:18`, `:31`, `:50`, `:64`).
- Identity confusion from display-name joins causing wrong rates applied to shifts/exports if names duplicate or are changed (`tt-ts/src/server/services/exportService.ts:17`, `tt-ts/src/server/services/exportUtils.ts:106`).

- Data exfiltration
- Managers/admins can export all timesheets and payroll totals via `/api/export/excel|pdf` (`tt-ts/src/server/routes/export.ts:17-21`, `:39-43`).
- Audit logs accessible to managers and may expose operational metadata (`tt-ts/src/server/routes/audit.ts:7`).
- `GET /api/users` returns all users including pay rates to managers (`tt-ts/src/server/routes/users.ts:9`, `tt-ts/src/server/auth/index.ts:66`).

- CSRF and browser attacks
- Session-cookie auth is used, but no CSRF protection/token validation is implemented on state-changing routes.
- `sameSite` is not set in session cookie config (`tt-ts/src/server/index.ts:28`), increasing CSRF exposure depending on browser defaults/deployment.

- Availability / abuse
- Export generation (Excel/PDF) can be expensive and is available to any authenticated user for self and managers/admins for all data (`tt-ts/src/server/routes/export.ts`).
- Login endpoint can be abused for credential stuffing or DoS (no throttling / lockouts).
- Default in-memory session store (`express-session` without `store`) is not suitable for production scale/reliability.

## 5. Vulnerability Analysis (VI)

### Positive controls observed
- Passwords are hashed with bcrypt (`tt-ts/src/server/auth/index.ts:6`, `:10`).
- SQL parameters are used for user-supplied values in auth/repository queries (e.g. `tt-ts/src/server/auth/index.ts:25`, `tt-ts/src/server/db/repository.ts:41`, `:177`), reducing direct SQL injection risk.
- Basic RBAC middleware exists (`tt-ts/src/server/middleware/auth.ts:3`, `:12`).
- Some sensitive admin actions include additional server-side checks (e.g. manager can only reset employee passwords in `tt-ts/src/server/auth/index.ts:272`; admin promotion restrictions in `:304-313`).
- Time-entry add/edit/delete changes are audit logged (`tt-ts/src/server/services/timeTracking.ts:92`, `:128`, `:137`).

### Key vulnerabilities / gaps (concrete)

#### V1. Weak production session configuration defaults
- Session secret falls back to a hardcoded dev string if `SESSION_SECRET` is missing (`tt-ts/src/server/index.ts:25`).
- No `sameSite` cookie setting (`tt-ts/src/server/index.ts:28`).
- No custom session store configured (`tt-ts/src/server/index.ts:24` uses default MemoryStore via `express-session`).
- Impact: session hijacking risk, CSRF risk, operational instability/multi-instance inconsistency.

#### V2. No session regeneration on login (session fixation risk)
- Login directly assigns `req.session.user = user` (`tt-ts/src/server/routes/auth.ts:18`) instead of regenerating session ID.
- Impact: attacker who can pre-seed a session ID may retain a usable authenticated session after victim login.

#### V3. No rate limiting / brute-force controls on auth endpoints
- `POST /api/auth/login` lacks throttling, lockouts, or backoff (`tt-ts/src/server/routes/auth.ts:7`).
- Password change and reset endpoints also lack throttling (`tt-ts/src/server/routes/auth.ts:41`, `tt-ts/src/server/routes/users.ts:93`).
- Impact: credential stuffing, account takeover, admin/manager compromise leading to payroll compromise.

#### V4. CSRF protections are absent on state-changing routes
- State-changing endpoints rely on session cookies (`/api/users`, `/api/shifts`, `/api/auth/change-password`, etc.) with no CSRF tokens/origin checks visible.
- Cookie config omits explicit `sameSite` (`tt-ts/src/server/index.ts:28`).
- Impact: authenticated manager/admin could be induced to perform payroll-impacting actions (pay-rate change, user deactivation, shift edit).

#### V5. Payroll-integrity operations lack validation and audit logging
- `/:id/pay-rates` forwards raw body values directly to `setUserPayRates` (`tt-ts/src/server/routes/users.ts:79-85`).
- `setUserPayRates` updates DB without numeric/type/range validation (`tt-ts/src/server/auth/index.ts:120-137`).
- No audit log entry is created for pay-rate changes, user activation/deactivation, role changes, password resets, or promotions (time-entry changes are logged, but user/payroll changes are not).
- Impact: silent pay tampering, accidental invalid values, weak forensic traceability for payroll disputes.

#### V6. RBAC too coarse for payroll data (manager == admin for many payroll-sensitive endpoints)
- `router.use(requireManager)` on `/api/users` grants managers access to all user CRUD + pay rates (`tt-ts/src/server/routes/users.ts:7`).
- Managers can retrieve all users and pay rates via `GET /api/users` (`tt-ts/src/server/routes/users.ts:9`, `tt-ts/src/server/auth/index.ts:66-92`).
- Impact: broader-than-necessary payroll data access; increased insider/compromised-manager blast radius.

#### V7. Identity linkage by display name instead of immutable user ID
- Employee-facing time operations bind to `session.user.display_name` (`tt-ts/src/server/routes/clock.ts:12`, `tt-ts/src/server/routes/timesheet.ts:13`).
- Repository queries and pay-rate lookup use case-insensitive display-name matching (`tt-ts/src/server/db/repository.ts:58`, `:90`; `tt-ts/src/server/auth/index.ts:108`).
- Exports map pay rates by normalized display name (`tt-ts/src/server/services/exportService.ts:17`, `tt-ts/src/server/services/exportUtils.ts:106`).
- Impact: duplicate names or renamed users can misattribute shifts/pay calculations (payroll integrity failure).

#### V8. Input validation gaps on date/pay-rate-type fields
- `new Date(...)` is used directly for query params and request body fields in `timesheet`, `export`, `shifts`, `audit` routes without validating `Invalid Date` (`tt-ts/src/server/routes/export.ts:13-14`, `tt-ts/src/server/routes/shifts.ts:26-29`, `tt-ts/src/server/routes/audit.ts:13-15`).
- `payRateOverride` is forwarded without enum enforcement (`tt-ts/src/server/routes/shifts.ts:31`, `:64`).
- Impact: reliability issues, potential unhandled exceptions/500s, corrupted payroll/time data.

#### V9. TLS DB config weakens certificate verification
- PostgreSQL pool forces `ssl: { rejectUnauthorized: false }` (`tt-ts/src/server/db/connection.ts:17`).
- Impact: weaker protection against MITM on DB connection in misconfigured or hostile networks.

#### V10. First-setup bootstrap endpoint is public and should be tightly controlled
- `/api/auth/first-setup` and `/api/auth/admin-count` are unauthenticated (`tt-ts/src/server/routes/auth.ts:56`, `:66`).
- `createFirstManager()` checks table emptiness but not an out-of-band setup token (`tt-ts/src/server/auth/index.ts:287`).
- Impact: if exposed before legitimate setup, an attacker can initialize a manager account.

## 6. Attack Analysis (AM)

### Scenario A: Attacker modifies pay rate (manager account takeover path)
Goal: Change an employee pay rate to fraudulently increase/decrease payroll.

Attack path
1. Attacker obtains manager credentials via credential stuffing against `/api/auth/login` (no rate limit; `tt-ts/src/server/routes/auth.ts:7`).
2. Authenticated attacker calls `POST /api/users/:id/pay-rates` (`tt-ts/src/server/routes/users.ts:78`).
3. Server accepts raw `standard/enhanced/supervisor` values and updates DB (`tt-ts/src/server/auth/index.ts:127`).
4. Exports calculate pay using updated rates (`tt-ts/src/server/services/exportUtils.ts:103-120`).
5. Change may be difficult to trace because pay-rate updates are not audit logged.

Impact
- Payroll fraud, underpayment/overpayment, staff disputes, reputational damage.

### Scenario B: CSRF causes manager browser to perform payroll-impacting actions
Goal: Use victim manager's authenticated session to alter payroll data.

Attack path
1. Manager is logged in to Tythe portal (session cookie present).
2. Manager visits attacker-controlled site.
3. Malicious page triggers cross-site POST to `/api/users/:id/pay-rates` or `/api/shifts/:id`.
4. Because app uses session cookies and lacks CSRF tokens/origin checks, request may be accepted depending on deployment/browser cookie policy.
5. Data is modified under manager identity.

Impact
- Silent tampering of pay rates or shifts; hard-to-prove incident if audit logging coverage is incomplete.

### Scenario C: Payroll export data exfiltration from compromised manager session
Goal: Exfiltrate payroll totals and staff working patterns.

Attack path
1. Attacker compromises a manager account/session.
2. Calls `GET /api/export/excel` without `employee` filter to retrieve all timesheets (`tt-ts/src/server/routes/export.ts:17-21`).
3. Export service loads all user pay rates (`tt-ts/src/server/services/exportService.ts:14`) and computes per-employee pay totals (`tt-ts/src/server/services/exportUtils.ts:103-120`).
4. Attacker exfiltrates Excel/PDF containing payroll-sensitive information.

Impact
- Confidential payroll disclosure across workforce.

### Scenario D: Payroll integrity failure via display-name collision
Goal: Cause pay to be calculated against wrong rates without direct DB access.

Attack path
1. Two users share the same or near-identical `display_name` (or display name is changed to collide).
2. Time entries are stored/query-linked by employee name string (`tt-ts/src/server/db/repository.ts:37`, `:58`, `:90`).
3. Export rate map also keys by normalized display name (`tt-ts/src/server/services/exportService.ts:17`).
4. Payroll export applies incorrect pay rates to one or both users.

Impact
- Systemic payroll errors, trust erosion, manual reconciliation overhead.

## 7. Risk & Impact Analysis (RI)

### Priority risk register (current state)

| Priority | Risk | Likelihood | Impact | Why now (payroll context) |
|---|---|---:|---:|---|
| P1 | Manager account takeover via login brute force / password reuse | High | Critical | Manager can edit pay rates, shifts, users, and export payroll data |
| P1 | Pay-rate tampering without validation/audit | Medium | Critical | Direct payroll manipulation; poor forensic accountability |
| P1 | CSRF on session-based state-changing endpoints | Medium | High | Can trigger payroll-impacting changes through manager/admin browser |
| P1 | Weak session controls (fallback secret, no regenerate, MemoryStore) | Medium | High | Session compromise can expose all payroll data |
| P2 | Display-name-based identity linkage for payroll/timesheets | Medium | High | Incorrect payroll calculations and data integrity failures |
| P2 | Overbroad manager access to user/pay data | Medium | High | Larger insider/compromised-account blast radius |
| P2 | Missing validation on dates/payRateOverride | Medium | Medium | Bad data / service errors during payroll processing |
| P3 | DB TLS `rejectUnauthorized: false` | Low-Med | Medium | Environmental but avoidable integrity/confidentiality weakness |
| P3 | Public first-setup endpoint exposure before initialization | Low-Med | High | Critical if app is ever deployed uninitialized |

### Actionable mitigations (effort / impact)

#### Immediate (high impact, low-medium effort)
1. Enforce a real `SESSION_SECRET` in production and fail startup if missing.
- Change `tt-ts/src/server/index.ts:25` to require env in production (no fallback).
- Add `SESSION_SECRET` to deployment/env documentation.
- Impact: removes predictable-secret risk.

2. Harden session cookie settings and session lifecycle.
- Add `sameSite: 'lax'` (or `'strict'` if UX allows), `name`, and optionally `rolling`/shorter idle timeout in `tt-ts/src/server/index.ts:28`.
- Regenerate session ID on login before storing `req.session.user` in `tt-ts/src/server/routes/auth.ts:18`.
- Clear cookie on logout in addition to destroy.
- Impact: reduces CSRF/session fixation/hijack risk.

3. Add rate limiting and login abuse defenses.
- Rate-limit `POST /api/auth/login` and password reset/change endpoints.
- Add IP + username throttling, temporary lockout/backoff, and audit events for repeated failures.
- Impact: major reduction in account takeover risk.

4. Add CSRF protection for all state-changing cookie-auth routes.
- Prefer CSRF token middleware (synchronizer token or double-submit) plus Origin/Referer checks.
- At minimum set `sameSite` and enforce Origin on `POST/PUT/DELETE` endpoints.
- Impact: blocks browser-driven payroll tampering.

5. Validate and constrain payroll-sensitive inputs.
- `/:id/pay-rates`: require numbers or null; reject negatives/out-of-range/unreasonable precision; enforce max values.
- `shifts` routes: validate dates (`!isNaN(date.getTime())`), ordering (`clock_out >= clock_in`), and `payRateOverride` enum.
- Impact: prevents accidental and malicious bad data entering payroll calculations.

6. Audit-log payroll and user security changes.
- Log pay-rate changes, user role changes, activation/deactivation, password resets, promotions, and first-setup.
- Include actor, target user ID, before/after values (excluding secrets/passwords).
- Impact: improves non-repudiation and incident response.

#### Near term (medium effort, high impact)
1. Split RBAC for payroll administration.
- Introduce finer permissions (e.g. `can_manage_users`, `can_manage_pay_rates`, `can_export_all_payroll`, `can_view_audit`).
- Restrict `/:id/pay-rates` and possibly `GET /api/users` pay fields to admin/payroll-admin only.
- Impact: reduces blast radius of compromised manager account.

2. Migrate time entries/payroll joins to immutable user IDs.
- Store `user_id` on `time_entries` and use it for queries/exports instead of `employee` display name.
- Keep display name as denormalized label only.
- Impact: fixes payroll integrity issues from name collisions/renames.

3. Replace default `MemoryStore` with a production session store.
- Use Redis/Postgres-backed session store with secure cookie config.
- Impact: reliability, scale, and better session management controls.

4. Add endpoint-level authorization tests and security regression tests.
- Test employee/manager/admin access to `/api/users`, `/api/export`, `/api/audit`, `/api/shifts`.
- Test manager cannot modify admin-only payroll actions if RBAC is tightened.
- Impact: prevents reintroduction of authorization bugs.

#### Medium term (higher effort)
1. Add anomaly detection / alerting for payroll-sensitive events.
- Alert on pay-rate changes near payroll cutoff, mass exports, multiple failed logins, role promotions.

2. Improve database transport security.
- Enable certificate validation (`rejectUnauthorized: true`) with proper CA config for Supabase/Postgres.

3. Introduce structured security logging and incident-ready telemetry.
- Correlate auth events, session IDs (hashed), actor IDs, target IDs, and export volume metrics.

### Suggested security acceptance criteria for “pay-enabled” readiness
- No production startup if `SESSION_SECRET` missing.
- Login endpoint rate-limited and monitored.
- CSRF protection enforced on all mutating routes.
- Pay-rate updates require explicit privilege and are fully audited.
- Payroll calculations use immutable user IDs, not display names.
- Managers cannot access payroll data unless explicitly required by policy.

## Summary (PASTA outcome)

The application has a solid baseline (bcrypt, parameterized SQL, basic RBAC), but the addition of pay rates and payroll exports materially increases confidentiality and integrity risk. The highest-priority gaps are session hardening, CSRF protection, login abuse controls, payroll change validation/auditing, and overly broad manager access to payroll-sensitive endpoints. Addressing those items should be treated as a prerequisite for production use of pay-enabled features.
