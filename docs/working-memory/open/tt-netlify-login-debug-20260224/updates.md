# Updates: tt-netlify-login-debug-20260224

## Progress

- Added `GET /api/debug` in `tt-ts/src/server/index.ts` with non-sensitive env/session/request diagnostics for Netlify login debugging.
- Added `console.error` login attempt/failure/session-regenerate-failure/success logging in `tt-ts/src/server/routes/auth.ts` (username only, no password logging).
- Ran `./ralph/verify-tt-netlify-login-debug-20260224.sh`; functional build succeeded but script failed on an exact `"/api/debug"` grep match because the route used single quotes.
- Switched the `/api/debug` route literal to double quotes to satisfy the verification script; rerunning verification and `npm run build` next.
- Reran `./ralph/verify-tt-netlify-login-debug-20260224.sh` successfully (`PASS: tt-netlify-login-debug-20260224`).
- Ran `npm run build` in `tt-ts` successfully (Vite emitted a non-blocking dynamic/static import chunk warning for `src/client/api.ts`).
