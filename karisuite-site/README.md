# Kari Suite — Main site (karisuite.com)

Static site for the Kari Suite homepage. Deploy to Cloud Run for karisuite.com and www.karisuite.com.

- **index.html** — Home page
- **privacy.html** — Privacy policy (links to Kari Time privacy for product details)
- **kari-time-marketing.html** — Redirects to https://time.karisuite.com/

Kari Time (the app) stays at time.karisuite.com — unchanged.

## Deploy to Cloud Run

### Option 1: One-time deploy (CLI)

```bash
./karisuite-site/deploy.sh
```

### Option 2: Deploy from repository (CI/CD)

In Google Cloud Console → Cloud Run → **Deploy from repository**:

1. Add a **second** trigger for the same repo
2. **Build context**: `karisuite-site` (or path to this folder)
3. **Dockerfile path**: `karisuite-site/Dockerfile`
4. **Service name**: `karisuite-site`
5. **Region**: `europe-west1`

Push to main will then deploy both the Kari Time app and the Kari Suite site.

### Domain mapping

After deploy, map karisuite.com and www.karisuite.com to the `karisuite-site` service:

- Cloud Run → Domain mappings → Add mapping
- Add `karisuite.com` and `www.karisuite.com`
- Update DNS with the records Cloud Run provides (A/AAAA, not ghs.googlehosted.com)

**Live URL**: https://karisuite-site-144765655694.europe-west1.run.app
