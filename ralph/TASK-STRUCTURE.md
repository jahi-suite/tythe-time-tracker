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

## Folder Structure

| Folder | Purpose |
|--------|---------|
| **open/** | Active tasks. run.sh only runs tasks in open/. |
| **done/** | Completed tasks. **When all stories pass, move the task from open/ to done/.** |

## Workflow

1. Agent reads plan.md + user_story.json + updates.md
2. Picks next story where `passes: false`
3. Implements per acceptance criteria
4. Commits
5. Runs verification (grep, tsc, npm run build, etc.)
6. Updates updates.md (pass: set `passes: true`; fail: record what worked/didn't)
7. **When all stories pass:** move task folder from open/ to done/, commit, stop

## Creating a New Task

1. Create `docs/working-memory/open/<task-id>/` with plan.md, user_story.json, updates.md
2. run.sh uses `ralph/prompts/_template.md` by default, or create `ralph/prompts/<task-id>.md` for task-specific instructions
3. Run `./ralph/run.sh <task-id>`
4. When complete, agent moves task to done/
