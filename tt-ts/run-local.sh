#!/usr/bin/env bash
# Run tt-ts locally. Kills existing processes on 3000/5173 first.
set -e

cd "$(dirname "$0")"

# Kill anything on 3000 or 5173
for port in 3000 5173; do
  pid=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "Killing process on port $port (PID $pid)"
    kill -9 $pid 2>/dev/null || kill $pid 2>/dev/null || true
    sleep 2
  fi
done

echo "Starting dev server (frontend: http://localhost:5173, API: http://localhost:3000)..."
npm run dev
