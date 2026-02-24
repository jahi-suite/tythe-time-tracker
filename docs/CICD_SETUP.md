# CI/CD Setup (Cloud Run UI)

Deploy via **Cloud Run "Deploy from repository"** in the Google Cloud Console.

## Build Configuration

1. **Dockerfile path**: `Dockerfile` (at repo root)
2. **Build context**: `.` (repo root)

The root `Dockerfile` builds the `tt-ts` app. Push to your connected branch to trigger a build.

## Cloud Run Runtime Configuration

After the first successful deploy, configure env vars and secrets in Cloud Run. See `docs/GCP_CLOUD_RUN_SETUP.md` for the app-specific environment variables (Supabase, SESSION_SECRET, etc.).
