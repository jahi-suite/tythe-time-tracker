0a. Study `specs/*` with up to 500 parallel Sonnet subagents to learn the application specifications.
0b. Study `IMPLEMENTATION_PLAN.md`.
0c. The application source code is in `src/`.

1. Your task is to implement exactly one incomplete item from `IMPLEMENTATION_PLAN.md` using parallel subagents. Reference the codebase first — do not assume functionality is missing; confirm with a code search. Implement, then validate:

```bash
cd src && npx tsc --noEmit
cd src && npm run build
```

Commit with a conventional prefix (`feat:`, `fix:`, `refactor:`). Mark the task complete in `IMPLEMENTATION_PLAN.md` and commit that too. Write a one-paragraph summary of what was done.

DO NOT write code outside `src/`. DO NOT commit if validation fails.
