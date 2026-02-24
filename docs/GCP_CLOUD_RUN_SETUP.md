# Google Cloud Run Deployment

Deploy the Tythe Time Tracker app to Cloud Run (serverless containers).

## Prerequisites

- Google Cloud CLI installed and authenticated (`gcloud auth login`)
- A GCP project (`gcloud config set project YOUR_PROJECT_ID`)

## Required Environment Variables

Set these in Cloud Run **Revision → Variables** (or via `gcloud run deploy --set-env-vars`):

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

## Deploy

From the repo root:

```bash
cd tt-ts
gcloud run deploy tythe-time-tracker \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,SESSION_STORE=pg" \
  --set-secrets "SUPABASE_HOST=supabase-host:latest,SUPABASE_PASSWORD=supabase-password:latest,SESSION_SECRET=session-secret:latest"
```

Or build and push manually:

```bash
cd tt-ts
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/tythe-time-tracker
gcloud run deploy tythe-time-tracker \
  --image gcr.io/YOUR_PROJECT_ID/tythe-time-tracker \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,SESSION_STORE=pg,SUPABASE_HOST=...,SUPABASE_DATABASE=postgres,SUPABASE_USER=...,SUPABASE_PORT=6543"
```

For secrets, use [Secret Manager](https://cloud.google.com/run/docs/configuring/secrets) and reference them in the deploy command.

## Env Template

Copy `tt-ts/gcp-env.template` and fill in values. Use it when configuring Cloud Run env vars.
