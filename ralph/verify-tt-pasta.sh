#!/usr/bin/env bash
# Verification for tt-pasta-analysis-20260223
# PASTA analysis document must exist and cover all 7 phases

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOC="$REPO_ROOT/docs/security/PASTA-analysis.md"

if [ ! -f "$DOC" ]; then
  echo "FAIL: docs/security/PASTA-analysis.md does not exist"
  exit 1
fi

# Must mention all 7 PASTA phases (flexible phrasing)
phases=(
  "Define the Objective"
  "Define the Technical"
  "Decompose"
  "Analyze the Threat"
  "Vulnerability"
  "Attack"
  "Risk"
)

for p in "${phases[@]}"; do
  if ! grep -qi "$p" "$DOC" 2>/dev/null; then
    echo "FAIL: Document missing phase: $p"
    exit 1
  fi
done

# Phase 7 must have mitigations or recommendations
if ! grep -qiE "mitigation|recommendation|action" "$DOC" 2>/dev/null; then
  echo "FAIL: Document missing mitigations/recommendations"
  exit 1
fi

echo "OK: PASTA analysis verification passed"
exit 0
