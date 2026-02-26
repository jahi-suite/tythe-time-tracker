# Ralph Wiggum — How We Build

This project uses the [Ralph Wiggum](https://github.com/ghuntley/how-to-ralph-wiggum) methodology.
Two phases. Two commands.

```
make lisa      ← define what to build
make ralph     ← build it
```

---

## The two phases

### Phase 1 — Lisa (Requirements)

Lisa is a long-lived Claude Opus agent. You vibe with her. She asks questions,
researches, and helps you think clearly about what you want. She can spawn
subagents to search the web or read the codebase. When you're both satisfied,
she writes a spec file.

**Lisa never writes application code. Ever.**

Her only output is `specs/*.md` — one file per topic, never duplicated.
If a spec for that topic already exists, she updates it.

```bash
make lisa                   # text: describe your idea, iterate, spec gets written
make voice                  # voice: speak your idea (mic), same flow
make voice FILE=idea.m4a    # voice: use a pre-recorded file
```

**What Lisa produces:**

```
specs/
├── auth.md
├── time-entries.md
├── exports.md
├── venues.md
├── email-verification.md
├── pay-rates.md
└── manager-dashboard.md    ← one file per topic, owned by Lisa
```

---

### Phase 2 — Ralph (Plan + Build)

Ralph is a fresh agent every iteration. He knows nothing when he starts.
He reads the specs and the plan, picks one task, and implements it.
Then the loop restarts and he does it again.

```bash
make ralph               # build loop — runs until you stop it
make ralph MODE=plan     # plan mode — reads specs, audits codebase, writes IMPLEMENTATION_PLAN.md
make ralph N=5           # build loop, max 5 iterations
```

**Plan mode** (`make ralph MODE=plan`):

1. Spawns up to 250 parallel Sonnet subagents to read every spec
2. Spawns up to 500 parallel Sonnet subagents to audit `src/` against the specs
3. Writes `IMPLEMENTATION_PLAN.md` — a prioritised TODO list with complete/incomplete status
4. Commits and stops

Run this whenever specs change or you want a fresh view of what's left.

**Build mode** (`make ralph`):

Each iteration:

1. Spawns up to 500 parallel Sonnet subagents to read specs and the plan
2. Picks the first incomplete task
3. Searches the codebase first — never re-implements something that already exists
4. Implements using parallel subagents (one per independent part)
5. Validates: `cd src && npx tsc --noEmit && npm run build` — must pass
6. Commits, marks task complete in `IMPLEMENTATION_PLAN.md`, commits again
7. Loop restarts

**Ralph never writes specs. Never touches `specs/` or `IMPLEMENTATION_PLAN.md` except to mark tasks done.**

---

## File map

| File | Owner | Purpose |
|---|---|---|
| `specs/*.md` | Lisa | One spec per topic. Source of truth for requirements. |
| `IMPLEMENTATION_PLAN.md` | Ralph (plan) | Prioritised TODO list derived from specs vs codebase. |
| `PROMPT_spec.md` | — | Lisa's instructions. Defines her constraints and workflow. |
| `PROMPT_plan.md` | — | Ralph's plan-mode instructions. |
| `PROMPT_build.md` | — | Ralph's build-mode instructions. |
| `AGENTS.md` | — | Project commands, architecture, business rules. Read by all agents. |
| `loop.sh` | — | The loop runner. Called by `make ralph`. |
| `scripts/voice-to-spec.sh` | — | Mic recording → Whisper transcription → Lisa session. |

---

## Typical workflow

```bash
# 1. Define a new feature with Lisa
make lisa
# → describe the feature, answer her questions, she writes specs/my-feature.md

# 2. Update the plan (after specs change)
make ralph MODE=plan
# → Ralph audits codebase against all specs, rewrites IMPLEMENTATION_PLAN.md

# 3. Build
make ralph
# → runs until interrupted; one task committed per iteration

# 4. Check progress
cat IMPLEMENTATION_PLAN.md
```

---

## Hard rules

| Rule | Lisa | Ralph (plan) | Ralph (build) |
|---|---|---|---|
| May write `specs/*.md` | ✅ | ❌ | ❌ |
| May write `IMPLEMENTATION_PLAN.md` | ❌ | ✅ | ✅ (mark done only) |
| May write `src/` | ❌ | ❌ | ✅ |
| May run builds | ❌ | ❌ | ✅ |
| May spawn subagents | ✅ research only | ✅ read only | ✅ implement + build |

---

## Voice setup

Requires local Whisper (no API key needed):

```bash
pip install openai-whisper
```

First run downloads the `small` model (~240 MB). Works via WSLg PulseAudio on
Windows/WSL2 — no additional audio configuration required.

---

## Requirements

- `claude` CLI installed (`scripts/install-claude.sh`)
- Node.js + npm (for `src/`)
- Python 3 + pip (for `tythe_time_tracker/` and Whisper)
- Supabase project (see `.env.example` in `src/`)
