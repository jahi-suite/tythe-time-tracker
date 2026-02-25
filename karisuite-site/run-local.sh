#!/usr/bin/env bash
# Run karisuite-site locally. Open http://localhost:8080
cd "$(dirname "$0")"
echo "Serving karisuite-site at http://localhost:8080"
echo "Press Ctrl+C to stop"
python3 -m http.server 8080
