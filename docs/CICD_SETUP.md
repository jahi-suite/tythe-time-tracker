# CI/CD Setup (GitHub Actions -> Cloud Run)

This project deploys `tt-ts` to Google Cloud Run when code is pushed to `main`.

## What the Workflow Uses

- GitHub Actions workflow: `.github/workflows/deploy-cloudrun.yml`
- Cloud Run service: `tythe-time-tracker`
- Region: `us-central1`
- **Auth**: Workload Identity Federation (OIDC) — no service account keys
- GitHub secrets:
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
- `Artifact Registry Admin` (required for `--source` deploy to create `cloud-run-source-deploy` repo)

Notes:

- `Cloud Build` and source-based deploys may also require additional permissions depending on project policy.
- If your org restricts broad roles, create a narrower custom role set and test the deployment.

## 3. Configure Workload Identity Federation (OIDC)

No keys needed. GitHub Actions authenticates via OIDC tokens.

```bash
# Create pool and provider (already done for jahi-suite/tythe-time-tracker)
gcloud iam workload-identity-pools create "github-pool" \
  --location="global" --display-name="GitHub Actions Pool" --project=karitime

gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" --workload-identity-pool="github-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == 'jahi-suite'" \
  --project=karitime

# Allow repo to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding github-cloudrun-deployer@karitime.iam.gserviceaccount.com \
  --project=karitime \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/144765655694/locations/global/workloadIdentityPools/github-pool/attribute.repository/jahi-suite/tythe-time-tracker"
```

## 4. Add the Project ID Secret

- Name: `GCP_PROJECT_ID`
- Value: your GCP project ID (e.g. `karitime`)

## 5. Confirm Deployment Behavior

On `push` to `main`, GitHub Actions will run:

- `google-github-actions/auth` using Workload Identity Federation (OIDC)
- `gcloud run deploy tythe-time-tracker --source . --region us-central1 --project $GCP_PROJECT_ID` from `tt-ts/`

## 6. Cloud Run Runtime Configuration (Manual)

The CI/CD workflow deploys the app, but runtime env vars/secrets for the service still need to be configured in Cloud Run. See `docs/GCP_CLOUD_RUN_SETUP.md` for the app-specific environment variables and secret setup.
