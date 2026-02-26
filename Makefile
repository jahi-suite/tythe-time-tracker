.PHONY: plan build once plan-once dev typecheck

plan:
	./loop.sh plan

build:
	./loop.sh

plan-once:
	./loop.sh plan 1

once:
	./loop.sh 1

dev:
	cd src && npm run dev

typecheck:
	cd src && npx tsc --noEmit
