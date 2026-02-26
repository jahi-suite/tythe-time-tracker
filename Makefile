.PHONY: lisa voice ralph dev typecheck

# Phase 1 — Requirements: vibe with Lisa, produce specs/*.md
lisa:
	cat PROMPT_spec.md | claude --model opus

# Phase 1 (voice variant) — speak your idea, Lisa transcribes and runs
voice:
	./scripts/voice-to-spec.sh $(FILE)

# Phase 2 — Build loop: plan then build, one task per iteration
# Usage: make ralph          (build loop, unlimited)
#        make ralph N=5      (build loop, max 5 iterations)
#        make ralph MODE=plan (plan mode — update IMPLEMENTATION_PLAN.md)
ralph:
	./loop.sh $(MODE) $(N)

# Dev utilities
dev:
	cd src && npm run dev

typecheck:
	cd src && npx tsc --noEmit
