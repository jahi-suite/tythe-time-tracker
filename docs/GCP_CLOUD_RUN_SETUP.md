# Google Cloud Run Deployment

Deploy the Tythe Time Tracker app to Cloud Run (serverless containers).

**Service**: `karitime` | **Region**: `europe-west2` | **Project**: `karitime`

## CI/CD

Deploy via **Cloud Run "Deploy from repository"** — push to the connected branch triggers a build and deploy. See `docs/CICD_SETUP.md`.

## Prerequisites

- Google Cloud CLI installed and authenticated (`gcloud auth login`)
- GCP project: `gcloud config set project karitime`

## Required Environment Variables

Set these in Cloud Run **Revision → Variables** (or via CLI).

**From tt-ts/.env (CLI):**

```bash
./ralph/set-cloudrun-env-from-dotenv.sh
```

This reads `tt-ts/.env`, overrides `SUPABASE_PORT=6543`, adds `NODE_ENV=production` and `SESSION_STORE=pg`, and runs `gcloud run services update karitime`.

| Variable | Notes |
|----------|-------|
| `SUPABASE_HOST` | Pooler host from Supabase → Settings → Database → Connection pooler |
| `SUPABASE_DATABASE` | Usually `postgres` |
| `SUPABASE_USER` | Pooler user (e.g. `postgres.xxxx`) |
| `SUPABASE_PASSWORD` | Your DB password |
| `SUPABASE_PORT` | Use `6543` (pooler) |
| `SESSION_SECRET` | Strong random string |
| `NODE_ENV` | `production` |
| `SESSION_STORE` | `pg` (required for sessions across instances) |

## Manual Deploy (Optional)

If you need to deploy from CLI without the repository trigger:

```bash
# Build from repo root (Dockerfile expects repo root context)
gcloud builds submit --tag gcr.io/karitime/karitime .
gcloud run deploy karitime \
  --image gcr.io/karitime/karitime \
  --region europe-west2 \
  --project karitime \
  --allow-unauthenticated
```

Then run `./ralph/set-cloudrun-env-from-dotenv.sh` to set env vars.

## Env Template

Copy `tt-ts/gcp-env.template` and fill in values. Use it when configuring Cloud Run env vars or when creating `tt-ts/.env`.
