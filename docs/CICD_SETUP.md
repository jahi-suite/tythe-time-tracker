# CI/CD Setup (Cloud Run)

Deploy via **Cloud Run "Deploy from repository"** in the Google Cloud Console.

## How It Works

1. Connect your GitHub repo to Cloud Run in the GCP Console.
2. Configure the build: **Dockerfile** at repo root, **build context** `.`
3. Push to the **connected branch** (e.g. `main`) → Cloud Build triggers → builds image → deploys new revision.

**Service**: `karitime` | **Region**: `europe-west2` | **Project**: `karitime`

## Build Configuration

| Setting | Value |
|---------|-------|
| Dockerfile path | `Dockerfile` (repo root) |
| Build context | `.` (repo root) |

The root `Dockerfile` builds the `tt-ts` app.

## Push to Main → Deploy?

Yes, **if** `main` is the branch you connected when setting up "Deploy from repository". Check **Cloud Build → Triggers** to see which branch triggers builds.

## Old Revisions

Cloud Run keeps up to **1000 revisions** per service. When that limit is reached, older non-serving revisions are auto-deleted. Inactive revisions do not incur cost.

To manually delete inactive revisions:

```bash
gcloud run revisions list --service=karitime --region=europe-west2 --project=karitime
gcloud run revisions delete REVISION_NAME --region=europe-west2 --project=karitime
```

## Runtime Configuration

After the first deploy, set env vars in Cloud Run. See `docs/GCP_CLOUD_RUN_SETUP.md` for Supabase, SESSION_SECRET, etc. Use `./ralph/set-cloudrun-env-from-dotenv.sh` to apply from `tt-ts/.env`.
