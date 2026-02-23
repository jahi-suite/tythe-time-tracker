#!/usr/bin/env bash
# Verification for tt-security-recommendations-20260223
# Checks that key security mitigations are in place

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Build must pass
cd tt-ts && npm run build 2>/dev/null || exit 1
cd "$REPO_ROOT"

# sec-01: SESSION_SECRET must be required in production (explicit check, no fallback)
if ! grep -qE "NODE_ENV.*production.*SESSION_SECRET|if.*production.*!.*SESSION_SECRET|throw.*SESSION_SECRET" tt-ts/src/server/index.ts 2>/dev/null; then
  echo "FAIL: sec-01 — SESSION_SECRET production check not found"
  exit 1
fi

# sec-02: sameSite on session cookie
if ! grep -q "sameSite" tt-ts/src/server/index.ts 2>/dev/null; then
  echo "FAIL: sec-02 — session cookie sameSite not set"
  exit 1
fi

# sec-02: session regenerate on login
if ! grep -qE "regenerate|regenerate\(" tt-ts/src/server/routes/auth.ts 2>/dev/null; then
  echo "FAIL: sec-02 — session regenerate on login not found"
  exit 1
fi

# sec-03: rate limit on auth (express-rate-limit or similar)
if ! grep -qE "rateLimit|rate-limit|rateLimit" tt-ts/src/server/routes/auth.ts 2>/dev/null; then
  echo "FAIL: sec-03 — rate limiting on auth not found"
  exit 1
fi

# sec-05: pay-rates validation (must have explicit validation, not just pass-through)
if ! grep -qE "typeof.*number|parseFloat|isNaN|Number\(|>= 0|<= 999|minValue|maxValue" tt-ts/src/server/routes/users.ts 2>/dev/null; then
  echo "FAIL: sec-05 — pay-rates validation not found"
  exit 1
fi

# sec-06: audit log for pay-rate changes (audit module called from auth)
if ! grep -qE "audit\.|logPayRate|auditLog|recordAudit" tt-ts/src/server/auth/index.ts 2>/dev/null; then
  echo "FAIL: sec-06 — audit logging for pay-rate changes not found"
  exit 1
fi

echo "OK: Security recommendations verification passed"
exit 0
