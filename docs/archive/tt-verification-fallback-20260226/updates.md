# tt-verification-fallback-20260226 — Updates

## Progress

- 2026-02-26T21:45:00Z — Completed `vf-01-middleware-refactor`. Refactored `requireEmailVerified` to be a no-op (pass-through) and added `requireEmailVerifiedForManager` which blocks managers/admins from unverified venues. Applied to `users`, `shifts`, `audit`, and `export` routes.
