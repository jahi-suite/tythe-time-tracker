# Task: tt-cicd-github-gcp-20260224

> Created: 2026-02-24 | Status: open
> **Goal**: Full CI/CD — push to main → deploy to GCP Cloud Run (production)

## Goal

When code is pushed to `main`, automatically build and deploy the tt-ts app to Google Cloud Run (production).

## Phases

### Phase 1: GitHub Actions workflow

Create `.github/workflows/deploy-cloudrun.yml`:

- **Trigger**: `push` to `main`
- **Steps**:
  1. Checkout repo
  2. Authenticate to GCP (using `GCP_SA_KEY` secret)
  3. Deploy to Cloud Run from `tt-ts/` using `gcloud run deploy --source .`

### Phase 2: GCP setup (manual, documented)

- Enable APIs: Cloud Run, Cloud Build, Artifact Registry (or Container Registry)
- Create service account with roles: Cloud Run Admin, Service Account User, Storage Admin (for image push)
- Create JSON key, add as GitHub secret `GCP_SA_KEY`
- Add GitHub secret `GCP_PROJECT_ID` (e.g. `karitime`)

### Phase 3: Documentation

- Add `docs/CICD_SETUP.md` with step-by-step setup for GitHub secrets and GCP permissions

## Key Files

- `.github/workflows/deploy-cloudrun.yml` (create)
- `tt-ts/Dockerfile` (exists)
- `docs/CICD_SETUP.md` (create)
- `docs/GCP_CLOUD_RUN_SETUP.md` (exists — env vars)

## Verification

- Workflow file exists and has correct trigger + deploy steps
- `tt-ts` build passes
- Manual: push to main, verify deploy runs in GitHub Actions
