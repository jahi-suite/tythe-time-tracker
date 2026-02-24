# Netlify Environment Variables

Copy these from your `tt-ts/.env` into Netlify **Site configuration → Environment variables**.

## Required variables

| Variable | Where to get it | Notes |
|----------|-----------------|-------|
| `SUPABASE_HOST` | Your `.env` | For serverless, use **pooler host** (e.g. `aws-0-xx.pooler.supabase.com`) from Supabase → Settings → Database → Connection pooler |
| `SUPABASE_DATABASE` | Your `.env` | Usually `postgres` |
| `SUPABASE_USER` | Your `.env` | Often `postgres.xxxx` for pooler |
| `SUPABASE_PASSWORD` | Your `.env` | Same as local |
| `SUPABASE_PORT` | **Use `6543`** | Serverless needs pooler (transaction mode). Override your local 5432. |
| `SESSION_SECRET` | Your `.env` | Same as local |
| `NODE_ENV` | **Add this** | Set to `production` |
| `SESSION_STORE` | **Add this** | Set to `pg` so sessions persist across serverless invocations |

## Quick import

1. Open `tt-ts/.env`
2. Copy all lines
3. In Netlify: **Add a variable** → **Import from .env** → paste
4. Edit `SUPABASE_PORT` to `6543` (if it was 5432)
5. Add `NODE_ENV` = `production`
6. Add `SESSION_STORE` = `pg`
7. Save and redeploy
