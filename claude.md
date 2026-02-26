# Claude Code — Tythe Time Tracker

## Structure

```
project-root/
├── loop.sh              # Ralph Wiggum loop runner
├── PROMPT_plan.md       # Planning prompt (./loop.sh plan)
├── PROMPT_build.md      # Build prompt  (./loop.sh)
├── AGENTS.md            # Agent guide: commands, architecture, business rules
├── IMPLEMENTATION_PLAN.md  # Current task queue (populated by ./loop.sh plan)
├── specs/               # Domain requirement specs
│   ├── auth.md
│   ├── time-entries.md
│   ├── exports.md
│   ├── venues.md
│   ├── email-verification.md
│   ├── pay-rates.md
│   └── manager-dashboard.md
├── src/                 # TypeScript/React app (Vite + Express)
├── tythe_time_tracker/  # Python/Streamlit app (legacy reference)
├── scripts/             # Operational utilities
│   ├── install-claude.sh
│   ├── setup-gemini-auth.sh
│   ├── set-cloudrun-env-from-dotenv.sh
│   ├── check-models.sh
│   └── status.sh
└── docs/
    ├── archive/         # Completed historical task records
    └── ...              # Architecture docs, guides
```

## How to run

```bash
# Plan: analyse codebase, update IMPLEMENTATION_PLAN.md
./loop.sh plan

# Build: execute next task from IMPLEMENTATION_PLAN.md
./loop.sh

# Single iteration (useful for testing)
./loop.sh plan 1
./loop.sh 1
```

## Apps

- **TypeScript app:** `cd src && npm run dev` (primary development target)
- **Python app:** `streamlit run app.py` (legacy reference)

See `AGENTS.md` for full command reference, architecture details, and business rules.
