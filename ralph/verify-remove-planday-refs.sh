#!/usr/bin/env bash
# Verification for remove-planday-refs-20260223
# Ensures no planday references in codebase or recent commits

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# refs-01: No planday in codebase (exclude remove-planday-refs task files)
if grep -ri planday "$REPO_ROOT" --exclude-dir=.git \
  --exclude="verify-remove-planday-refs.sh" \
  --exclude="remove-planday-refs-20260223.sh" \
  --exclude="remove-planday-refs-20260223.md" \
  --exclude-dir="remove-planday-refs-20260223" 2>/dev/null | grep -q .; then
  echo "FAIL: refs-01 — planday reference found in codebase"
  exit 1
fi

# refs-02: No planday in recent commit messages
if git -C "$REPO_ROOT" log --oneline -15 2>/dev/null | grep -qi planday; then
  echo "FAIL: refs-02 — planday found in recent commit messages"
  exit 1
fi

# refs-03: tt-ts build succeeds
cd "$REPO_ROOT/tt-ts" && npm run build 2>/dev/null || {
  echo "FAIL: refs-03 — tt-ts build failed"
  exit 1
}

echo "OK: Remove styling task refs verification passed"
exit 0
