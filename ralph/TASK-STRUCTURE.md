# Ralph Task Structure

**One way only.** Every task uses the same structure. There is no plan-only mode.

## Required Artifacts

| File | Purpose |
|------|---------|
| `plan.md` | PRD/context: what and why, affected files, verification command |
| `user_story.json` | Small user stories with acceptance criteria; each has `id`, `title`, `acceptance_criteria`, `passes` |
| `updates.md` | Progress log and failure notes |

## user_story.json Schema

```json
{
  "initiative": "<task-id>",
  "updated": "<YYYY-MM-DD>",
  "stories": [
    {
      "id": "story-01",
      "title": "Short human-readable title",
      "acceptance_criteria": "Testable, specific criteria. What must be true for this story to pass?",
      "passes": false
    }
  ]
}
```

- **id** — Unique within task (e.g. `auth-01`, `parity-02`)
- **title** — One-line summary
- **acceptance_criteria** — Verifiable conditions; external verification (grep, tsc, tests, verify script) decides pass/fail
- **passes** — `true` when criteria are met; agent sets this after verification

## Workflow

1. Agent reads plan.md + user_story.json + updates.md
2. Picks next story where `passes: false`
3. Implements per acceptance criteria
4. Commits
5. Runs verification
6. Updates updates.md:
   - If pass: what was done; set `passes: true`
   - If fail: what was tried, what worked, what didn't, what to try next
7. Next iteration reads failure notes and retries

## Migrating Plan-Only Tasks

Tasks that currently have only plan.md with inline stories need a user_story.json. For each story in the plan:

1. Add an entry to `stories` with `id`, `title`, `acceptance_criteria`, `passes: false`
2. Extract or write testable acceptance criteria from the plan prose
3. Ensure the prompt uses `{{STORY_ID}}` and reads user_story.json
