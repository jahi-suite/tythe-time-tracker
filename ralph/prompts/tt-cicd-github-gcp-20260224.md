You are a Ralph execution agent. Set up CI/CD: GitHub Actions → Cloud Run on push to main. Fresh context — everything you need is on disk.

## Orient

```bash
git log --oneline -5
git status
ls docs/working-memory/open/
```

Read:
- docs/working-memory/open/tt-cicd-github-gcp-20260224/plan.md
- docs/working-memory/open/tt-cicd-github-gcp-20260224/updates.md (if present)
- docs/GCP_CLOUD_RUN_SETUP.md
- tt-ts/Dockerfile

## CRITICAL RULES

1. **Do NOT run verify scripts** — those are for the USER to run.
2. **One phase per iteration** — implement Phase 1, then Phase 2 (docs), then Phase 3.
3. **One atomic change per iteration** — commit after each.
4. **Check updates.md** — pick the next uncompleted phase.

## Phases

1. **Phase 1**: Create `.github/workflows/deploy-cloudrun.yml` — trigger on push to main, auth to GCP, deploy tt-ts to Cloud Run
2. **Phase 2**: Create `docs/CICD_SETUP.md` — document GCP service account, GitHub secrets (GCP_SA_KEY, GCP_PROJECT_ID), required APIs
3. **Phase 3**: Verify workflow syntax (e.g. action-validator if available) and update plan/updates

## Workflow requirements

- Trigger: `push` branches `[main]`
- Auth: `google-github-actions/auth` with `credentials_json: ${{ secrets.GCP_SA_KEY }}`
- Deploy: from `tt-ts/` directory, `gcloud run deploy tythe-time-tracker --source . --region us-central1 --project ${{ secrets.GCP_PROJECT_ID }}`
- Service name: `tythe-time-tracker`
- Region: `us-central1`

## Commit style

- feat: or docs: with conventional message
- Update docs/working-memory/open/tt-cicd-github-gcp-20260224/updates.md when done
