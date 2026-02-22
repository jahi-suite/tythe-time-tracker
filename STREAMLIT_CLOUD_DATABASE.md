# Fix "Failed to initialize database" on Streamlit Cloud

Streamlit Cloud is **IPv4-only**. Supabase's **direct** connection (`db.xxx.supabase.co:5432`) is IPv6-only, so it will not work. You must use the **Session pooler** instead.

## Steps

### 1. Get your Session pooler details from Supabase

1. Open your project: **https://supabase.com/dashboard/project/nfwzrlxhjcxdznsnkhhm**
2. Click **Connect** (top right) or go to **Project Settings** → **Database**.
3. In the connection modal, set **Method** to **Session pooler** (not "Direct connection").
4. You’ll see a URI like:
   ```text
   postgres://postgres.nfwzrlxhjcxdznsnkhhm:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
   ```
5. From that URI note:
   - **Host:** the part after `@` and before `:5432` (e.g. `aws-0-eu-west-1.pooler.supabase.com`)
   - **Port:** `5432`
   - **User:** `postgres.nfwzrlxhjcxdznsnkhhm` (postgres + your project ref)
   - **Password:** your database password

### 2. Put this in Streamlit Cloud Secrets

In Streamlit Cloud → your app → **Settings** → **Secrets**, replace everything with (use your real **host** from step 1 and your real **password**):

```toml
[SUPABASE]
HOST = "aws-0-eu-west-1.pooler.supabase.com"
DATABASE = "postgres"
USER = "postgres.nfwzrlxhjcxdznsnkhhm"
PASSWORD = "3Spressomartini!!"
PORT = "5432"

MANAGER_PASSWORD = "tythe2024"
```

- Replace `aws-0-eu-west-1.pooler.supabase.com` with the **exact host** Supabase shows for Session pooler (your region may differ, e.g. `aws-0-us-east-1.pooler.supabase.com`).
- Keep **USER** as `postgres.nfwzrlxhjcxdznsnkhhm`.
- Save, then redeploy or refresh the app.

### 3. If it still fails

- Confirm the **host** in Secrets matches the Session pooler host in Supabase (no typos, correct region).
- Confirm **USER** is `postgres.nfwzrlxhjcxdznsnkhhm` (with a dot, not `postgres` only).
- The app will show the exact error message; use that to debug (e.g. wrong password, wrong host).
