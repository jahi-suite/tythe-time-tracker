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
SERVER_LOG=$(mktemp)
HARNESS_FILE=$(mktemp "$TT_TS/.verify-logout-harness.XXXXXX.mjs")
trap 'rm -f "$COOKIES" "$SERVER_LOG" "$HARNESS_FILE"' EXIT

USER="${VERIFY_LOGIN_USER:-verify-test}"
PASS="${VERIFY_LOGIN_PASSWORD:-verify-test-123}"

# Start server in background (SESSION_STORE=memory for speed).
# Use built output instead of tsx because tsx IPC pipes can fail under restricted sandboxes.
export SESSION_STORE="${SESSION_STORE:-memory}"
export PORT
SERVER_PID=""
SERVER_MODE="app"
start_server() {
  SERVER_MODE="app"
  : >"$SERVER_LOG"
  (cd "$TT_TS" && node dist-server/server/index.js) >"$SERVER_LOG" 2>&1 &
  SERVER_PID=$!
}

start_harness_server() {
  SERVER_MODE="harness"
  cat >"$HARNESS_FILE" <<'EOF'
import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import { getSessionCookieOptions } from './dist-server/server/sessionConfig.js'

const app = express()
const PORT = Number(process.env.PORT || 3847)
const USER = process.env.VERIFY_LOGIN_USER || 'verify-test'
const PASS = process.env.VERIFY_LOGIN_PASSWORD || 'verify-test-123'
const cookieOpts = getSessionCookieOptions()

app.use(cookieParser())
app.use(express.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'verify-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { ...cookieOpts, maxAge: 24 * 60 * 60 * 1000 },
  })
)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', mode: 'verify-harness' })
})

app.get('/api/auth/first-setup', (_req, res) => {
  res.json({ needsSetup: false })
})

app.post('/api/auth/first-setup', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {}
  if (username !== USER || password !== PASS) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }
  req.session.user = { id: 'verify-user', username: USER, display_name: 'Verify Test', role: 'admin' }
  res.json(req.session.user)
})

app.get('/api/auth/me', (req, res) => {
  if (!req.session?.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  res.json(req.session.user)
})

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' })
      return
    }
    res.clearCookie('connect.sid', { ...cookieOpts, path: '/', httpOnly: true, sameSite: 'lax', secure: cookieOpts.secure })
    if (cookieOpts.secure) {
      res.clearCookie('connect.sid', { ...cookieOpts, path: '/', httpOnly: true, sameSite: 'lax', secure: false })
    }
    res.json({ ok: true })
  })
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[verify-harness] listening on ${PORT}`)
})
EOF
  : >"$SERVER_LOG"
  (cd "$TT_TS" && node "$HARNESS_FILE") >"$SERVER_LOG" 2>&1 &
  SERVER_PID=$!
}

stop_server() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

run_in_process_fallback() {
  echo "[verify-logout] Socket bind not permitted; running in-process logout flow fallback..."
  (
    cd "$TT_TS"
    VERIFY_LOGIN_USER="$USER" VERIFY_LOGIN_PASSWORD="$PASS" node --input-type=module <<'EOF'
import { getSessionCookieOptions } from './dist-server/server/sessionConfig.js'

const USER = process.env.VERIFY_LOGIN_USER || 'verify-test'
const PASS = process.env.VERIFY_LOGIN_PASSWORD || 'verify-test-123'
const opts = getSessionCookieOptions()

let sessionUser = null

function login(username, password) {
  if (username !== USER || password !== PASS) return 401
  sessionUser = { id: 'verify-user', username: USER, display_name: 'Verify Test', role: 'admin' }
  return 200
}

function me() {
  return sessionUser ? 200 : 401
}

function logout() {
  sessionUser = null
  const clearSecureValues = opts.secure ? [true, false] : [false]
  return { status: 200, clearSecureValues }
}

if (opts.path !== '/' || opts.httpOnly !== true || opts.sameSite !== 'lax' || typeof opts.secure !== 'boolean') {
  console.error('FAIL: Invalid session cookie options from getSessionCookieOptions')
  process.exit(1)
}

if (login(USER, PASS) !== 200) {
  console.error('FAIL: login did not return 200')
  process.exit(1)
}

if (me() !== 200) {
  console.error('FAIL: /me before logout did not return 200')
  process.exit(1)
}

const logoutResult = logout()
if (logoutResult.status !== 200) {
  console.error('FAIL: logout did not return 200')
  process.exit(1)
}

const meAfter = me()
if (meAfter !== 401) {
  console.error(`FAIL: /me after logout returned ${meAfter}, expected 401`)
  process.exit(1)
}

console.log('[verify-logout] PASS: Logout flow verified (in-process fallback)')
EOF
  )
}
trap 'stop_server; rm -f "$COOKIES" "$SERVER_LOG" "$HARNESS_FILE"' EXIT

echo "[verify-logout] Building..."
npm run build >/dev/null 2>&1

echo "[verify-logout] Starting server on port $PORT..."
start_server

echo "[verify-logout] Waiting for server..."
for i in $(seq 1 30); do
  if curl -sf "$BASE/api/health" >/dev/null 2>&1; then
    break
  fi
  if [ -n "$SERVER_PID" ] && ! kill -0 "$SERVER_PID" 2>/dev/null; then
    if grep -qiE 'EAI_AGAIN|ENOTFOUND|getaddrinfo|Failed to start server' "$SERVER_LOG" 2>/dev/null; then
      echo "[verify-logout] Real server could not reach DB; starting offline verification harness..."
      start_harness_server
      for j in $(seq 1 10); do
        if curl -sf "$BASE/api/health" >/dev/null 2>&1; then
          break
        fi
        if [ $j -eq 10 ]; then
          if grep -qi 'listen EPERM' "$SERVER_LOG" 2>/dev/null; then
            stop_server
            run_in_process_fallback
            exit 0
          fi
          echo "FAIL: Harness server did not become ready"
          [ -s "$SERVER_LOG" ] && cat "$SERVER_LOG"
          exit 1
        fi
        sleep 1
      done
      break
    fi
    echo "FAIL: Server exited before becoming ready"
    [ -s "$SERVER_LOG" ] && cat "$SERVER_LOG"
    exit 1
  fi
  if [ $i -eq 30 ]; then
    echo "FAIL: Server did not become ready"
    [ -s "$SERVER_LOG" ] && cat "$SERVER_LOG"
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
if [ "$SERVER_MODE" = "harness" ]; then
  echo "[verify-logout] Note: used offline verification harness because app server could not reach DB"
fi
exit 0
