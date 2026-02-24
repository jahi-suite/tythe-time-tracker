# CI/CD Setup (GitHub Actions -> Cloud Run)

This project deploys `tt-ts` to Google Cloud Run when code is pushed to `main`.

## What the Workflow Uses

- GitHub Actions workflow: `.github/workflows/deploy-cloudrun.yml`
- Cloud Run service: `tythe-time-tracker`
- Region: `us-central1`
- GitHub secrets:
  - `GCP_SA_KEY` (service account JSON key)
  - `GCP_PROJECT_ID` (target GCP project ID)

## 1. Enable Required GCP APIs

Enable these APIs in the target GCP project:

- Cloud Run Admin API
- Cloud Build API
- Artifact Registry API

You can enable them in the GCP Console or with `gcloud services enable`.

## 2. Create a Service Account for GitHub Actions

Create a dedicated service account (example name: `github-cloudrun-deployer`).

Grant at least these roles:

- `Cloud Run Admin`
- `Service Account User`
- `Storage Admin`

Notes:

- `Cloud Build` and source-based deploys may also require additional permissions depending on project policy.
- If your org restricts broad roles, create a narrower custom role set and test the deployment.

## 3. Create and Store the Service Account Key

1. Create a JSON key for the service account.
2. In GitHub, open the repository settings.
3. Go to `Settings -> Secrets and variables -> Actions`.
4. Add a new repository secret:
   - Name: `GCP_SA_KEY`
   - Value: paste the full JSON key contents

## 4. Add the Project ID Secret

Add another repository secret:

- Name: `GCP_PROJECT_ID`
- Value: your GCP project ID (for example, `karitime`)

## 5. Confirm Deployment Behavior

On `push` to `main`, GitHub Actions will run:

- `google-github-actions/auth` using `GCP_SA_KEY`
- `gcloud run deploy tythe-time-tracker --source . --region us-central1 --project $GCP_PROJECT_ID` from `tt-ts/`

## 6. Cloud Run Runtime Configuration (Manual)

The CI/CD workflow deploys the app, but runtime env vars/secrets for the service still need to be configured in Cloud Run. See `docs/GCP_CLOUD_RUN_SETUP.md` for the app-specific environment variables and secret setup.
