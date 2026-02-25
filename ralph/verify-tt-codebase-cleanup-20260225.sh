#!/usr/bin/env bash
# Verify: tt-codebase-cleanup-20260225
# Whole-codebase cleanup — cruft removed, no tracked artifacts, reasonable structure
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PASS=0
FAIL=0

# --- Ralph & working memory ---
[ -f "ralph/set-cloudrun-env-from-dotenv.sh" ] && { echo "PASS: ralph/set-cloudrun-env-from-dotenv.sh exists"; PASS=$((PASS+1)); } || { echo "FAIL: ralph/set-cloudrun-env-from-dotenv.sh missing"; FAIL=$((FAIL+1)); }
[ -f "Dockerfile" ] && { echo "PASS: Root Dockerfile exists"; PASS=$((PASS+1)); } || { echo "FAIL: Root Dockerfile missing"; FAIL=$((FAIL+1)); }
[ ! -e "ralph/Untitled" ] && { echo "PASS: ralph/Untitled removed"; PASS=$((PASS+1)); } || { echo "FAIL: ralph/Untitled still exists"; FAIL=$((FAIL+1)); }
OPEN_COUNT=$(ls -d docs/working-memory/open/*/ 2>/dev/null | wc -l)
[ "$OPEN_COUNT" -lt 20 ] && { echo "PASS: Open tasks $OPEN_COUNT (< 20)"; PASS=$((PASS+1)); } || { echo "FAIL: $OPEN_COUNT open tasks (target < 20)"; FAIL=$((FAIL+1)); }

# --- Root cruft: one-off scripts removed ---
CRUFT=""
for f in debug_env.py debug_shift.py check_gitignore.py test_connection.py update_database.py; do
  [ -f "$f" ] && CRUFT="$CRUFT $f"
done
[ -z "$CRUFT" ] && { echo "PASS: No root cruft scripts (debug_*, check_gitignore, test_connection, update_database)"; PASS=$((PASS+1)); } || { echo "FAIL: Root cruft present:$CRUFT"; FAIL=$((FAIL+1)); }

# --- No large/tracked artifacts in git ---
TRACKED_BAD=$(git ls-files | grep -E 'google-cloud-sdk|google-cloud-cli.*\.tar\.gz|\.coverage$|coverage\.xml|htmlcov/' 2>/dev/null || true)
[ -z "$TRACKED_BAD" ] && { echo "PASS: No gcloud/coverage artifacts tracked in git"; PASS=$((PASS+1)); } || { echo "FAIL: Tracked artifacts:"; echo "$TRACKED_BAD"; FAIL=$((FAIL+1)); }

# --- farm-scaled.jpg: unused image removed (or used) ---
if [ -f "farm-scaled.jpg" ]; then
  if grep -rq "farm-scaled" --include="*.py" --include="*.tsx" --include="*.ts" --include="*.html" . 2>/dev/null; then
    echo "PASS: farm-scaled.jpg exists and is referenced"
    PASS=$((PASS+1))
  else
    echo "FAIL: farm-scaled.jpg exists but not referenced (remove or add reference)"
    FAIL=$((FAIL+1))
  fi
else
  echo "PASS: farm-scaled.jpg removed"
  PASS=$((PASS+1))
fi

# --- .gitignore covers coverage/gcloud ---
grep -qE '\.coverage|coverage\.xml|htmlcov|google-cloud' .gitignore 2>/dev/null && { echo "PASS: .gitignore covers coverage/gcloud"; PASS=$((PASS+1)); } || { echo "FAIL: .gitignore missing coverage/gcloud entries"; FAIL=$((FAIL+1)); }

# --- Cleanup task plan exists ---
[ -f "docs/working-memory/open/tt-codebase-cleanup-20260225/plan.md" ] && { echo "PASS: Cleanup task plan exists"; PASS=$((PASS+1)); } || { echo "FAIL: Cleanup task plan missing"; FAIL=$((FAIL+1)); }

echo ""
echo "--- $PASS passed, $FAIL failed ---"
[ $FAIL -eq 0 ]
