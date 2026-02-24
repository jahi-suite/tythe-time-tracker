#!/usr/bin/env bash
# Verification for tt-netlify-fullstack-20260224
# Netlify full-stack deployment config

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NETLIFY_TOML="$REPO_ROOT/netlify.toml"
SERVER_INDEX="$REPO_ROOT/tt-ts/src/server/index.ts"
NETLIFY_FUNC="$REPO_ROOT/tt-ts/netlify/functions/server.ts"

if [ ! -f "$NETLIFY_TOML" ]; then
  echo "FAIL: netlify.toml not found at repo root"
  exit 1
fi

if ! grep -q "base = \"tt-ts\"" "$NETLIFY_TOML"; then
  echo "FAIL: netlify.toml missing base = \"tt-ts\""
  exit 1
fi

if ! grep -q "/api/\*" "$NETLIFY_TOML"; then
  echo "FAIL: netlify.toml missing /api/* redirect"
  exit 1
fi

if ! grep -q "functions/server" "$NETLIFY_TOML"; then
  echo "FAIL: netlify.toml missing functions/server redirect target"
  exit 1
fi

if [ ! -f "$NETLIFY_FUNC" ]; then
  echo "FAIL: tt-ts/netlify/functions/server.ts not found"
  exit 1
fi

if ! grep -q "createApp" "$SERVER_INDEX"; then
  echo "FAIL: server/index.ts must export or use createApp"
  exit 1
fi

if ! grep -q "serverless-http" "$REPO_ROOT/tt-ts/package.json"; then
  echo "FAIL: serverless-http not in tt-ts dependencies"
  exit 1
fi

cd "$REPO_ROOT/tt-ts" && npm run build:client 2>/dev/null || {
  echo "FAIL: npm run build:client failed"
  exit 1
}

echo "OK: Netlify full-stack verification passed"
exit 0
