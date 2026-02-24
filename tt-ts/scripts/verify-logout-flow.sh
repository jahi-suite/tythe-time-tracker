#!/usr/bin/env bash
# Verify logout flow: login -> me -> logout -> me (401)
# Requires: DB configured in .env. Optional: VERIFY_LOGIN_USER, VERIFY_LOGIN_PASSWORD
# If DB is empty, creates verify-test user via first-setup.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TT_TS="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$TT_TS/.." && pwd)"
cd "$TT_TS"

PORT="${PORT:-3847}"
BASE="http://127.0.0.1:$PORT"
COOKIES=$(mktemp)
trap 'rm -f "$COOKIES"' EXIT

USER="${VERIFY_LOGIN_USER:-verify-test}"
PASS="${VERIFY_LOGIN_PASSWORD:-verify-test-123}"

# Start server in background (SESSION_STORE=memory for speed)
export SESSION_STORE="${SESSION_STORE:-memory}"
export PORT
SERVER_PID=""
start_server() {
  (cd "$TT_TS" && npx tsx src/server/index.ts) &
  SERVER_PID=$!
}

stop_server() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap 'stop_server; rm -f "$COOKIES"' EXIT

echo "[verify-logout] Building..."
npm run build >/dev/null 2>&1

echo "[verify-logout] Starting server on port $PORT..."
start_server

echo "[verify-logout] Waiting for server..."
for i in $(seq 1 30); do
  if curl -sf "$BASE/api/health" >/dev/null 2>&1; then
    break
  fi
  if [ $i -eq 30 ]; then
    echo "FAIL: Server did not become ready"
    exit 1
  fi
  sleep 1
done

echo "[verify-logout] Ensuring test user..."
if curl -sf "$BASE/api/auth/first-setup" | grep -q '"needsSetup":true'; then
  curl -sf -X POST "$BASE/api/auth/first-setup" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER\",\"password\":\"$PASS\",\"displayName\":\"Verify Test\"}" >/dev/null || {
    echo "FAIL: first-setup failed. Set VERIFY_LOGIN_USER and VERIFY_LOGIN_PASSWORD for existing user."
    exit 1
  }
fi

echo "[verify-logout] Login..."
curl -sf -c "$COOKIES" -b "$COOKIES" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}" >/dev/null || {
  echo "FAIL: Login failed. Set VERIFY_LOGIN_USER and VERIFY_LOGIN_PASSWORD."
  exit 1
}

echo "[verify-logout] GET /me (expect 200)..."
ME_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" -b "$COOKIES" "$BASE/api/auth/me")
if [ "$ME_STATUS" != "200" ]; then
  echo "FAIL: /me returned $ME_STATUS, expected 200"
  exit 1
fi

echo "[verify-logout] POST /logout..."
curl -sf -c "$COOKIES" -b "$COOKIES" -X POST "$BASE/api/auth/logout" >/dev/null || true

echo "[verify-logout] GET /me after logout (expect 401)..."
ME_AFTER=$(curl -sf -o /dev/null -w "%{http_code}" -b "$COOKIES" "$BASE/api/auth/me")
if [ "$ME_AFTER" != "401" ]; then
  echo "FAIL: /me after logout returned $ME_AFTER, expected 401"
  exit 1
fi

echo "[verify-logout] PASS: Logout flow verified"
exit 0
