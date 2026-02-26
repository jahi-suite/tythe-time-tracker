# Google Cloud Secret Manager Setup

KariSuite uses Secret Manager to securely store sensitive configuration. These secrets are injected into Cloud Run as environment variables.

## Required Secrets

| Environment Variable | Description | Example |
|----------------------|-------------|---------|
| `DATABASE_URL` | Supabase/PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `SESSION_SECRET` | Secret for express-session | `a-long-random-string` |
| `SMTP_HOST` | SMTP Relay Host | `smtp-relay.gmail.com` |
| `SMTP_PORT` | SMTP Relay Port | `587` |
| `SMTP_USER` | SMTP Authentication User | `admin@tythebarn.com` |
| `SMTP_PASS` | SMTP Authentication Password | `xxxx-xxxx-xxxx-xxxx` |
| `EMAIL_FROM` | Sender Address | `KariSuite <noreply@karisuite.com>` |
| `APP_BASE_URL` | Base URL of the application | `https://kari-time.a.run.app` |

## Setup Instructions

1.  **Create Secrets**:
    ```bash
    gcloud secrets create SMTP_PASS --replication-policy="automatic"
    echo -n "your-password" | gcloud secrets versions add SMTP_PASS --data-file=-
    ```

2.  **Grant Access**:
    The Cloud Run service account must have `Secret Manager Secret Accessor` role.
    ```bash
    gcloud secrets add-iam-policy-binding SMTP_PASS 
      --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" 
      --role="roles/secretmanager.secretAccessor"
    ```

3.  **Deploy to Cloud Run**:
    Reference the secrets in your deployment:
    ```bash
    gcloud run deploy kari-time 
      --set-secrets="SMTP_PASS=SMTP_PASS:latest" 
      ...
    ```

## Local Development

For local development, use a `.env` file (see `.env.example`).
