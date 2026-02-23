# Updates: tt-security-recommendations-20260223

- Task created. Goal: implement PASTA security recommendations (session, rate limit, CSRF, validation, audit, RBAC).
- Completed `sec-01` (2026-02-23): enforce `SESSION_SECRET` in production in `tt-ts/src/server/index.ts` (fail startup if missing); documented requirement in `tt-ts/.env.example` and `tt-ts/README.md`.
- Completed `sec-02` (2026-02-23): hardened session cookie with `sameSite: 'lax'` in `tt-ts/src/server/index.ts`; regenerated session ID on login and explicitly cleared session cookie on logout in `tt-ts/src/server/routes/auth.ts`.
