# 🚀 Supabase Setup Guide (For Beginners)

This guide will help you set up a free Supabase database and connect it to The Tythe Barn Time Tracker app. No technical experience needed!

---

## 1. Create a Free Supabase Account

1. Go to [https://supabase.com/](https://supabase.com/)
2. Click **Start your project** (top right)
3. Sign up with your email and create a password

---

## 2. Create a New Project

1. After logging in, click the **New project** button
2. **Project Name:** (anything you like, e.g. `tythe-time-tracker`)
3. **Password:** Create a strong password (write it down!)
4. **Region:** Choose the default or your closest region
5. Click **Create new project**

*Wait a minute for your project to be ready.*

---

## 3. Get Your Database Credentials

1. In your Supabase project, click **Settings** (left menu)
2. Click **Database**
3. Scroll down to **Connection string** section
4. **Choose "Direct connection"** (not pooler)
5. You'll see a connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abc123.supabase.co:5432/postgres
   ```

**Extract these values:**
- **Host:** `db.abc123.supabase.co` (the part after @ and before :5432)
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** `[YOUR-PASSWORD]` (the password you set)
- **Port:** `5432`

---

## 4. Connect the app: local (`.env`) or Streamlit Cloud (Secrets)

### Option A – Running locally

1. Copy `env.example` to `.env`:  
   `cp env.example .env`
2. Open `.env` and set:

```
SUPABASE_HOST=db.abc123.supabase.co
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your-database-password
SUPABASE_PORT=5432
MANAGER_PASSWORD=your-manager-password
```

Replace the values with your actual Supabase details.

### Option B – Deploying on Streamlit Cloud

**Use the Session pooler** (not the direct connection), or the app may fail to connect (IPv4).

1. In **Supabase**: Connect to your project → **Connection string** → set **Method** to **Session pooler**. Note the **host** (e.g. `aws-0-eu-west-1.pooler.supabase.com`), **port 6543**, and **user** (often `postgres.YOUR_PROJECT_REF`).
2. In **Streamlit Cloud**, open your app → **Settings** → **Secrets**. Paste and fill in:

```toml
[SUPABASE]
HOST = "aws-0-XX-XXXXX.pooler.supabase.com"
DATABASE = "postgres"
USER = "postgres.YOUR_PROJECT_REF"
PASSWORD = "your-database-password"
PORT = "6543"

MANAGER_PASSWORD = "your-manager-password"
```

3. Save and redeploy. The app will use these when it runs in the cloud.

---

## 5. Save and Close `.env`

- Make sure to **save** the file after editing.
- **Never share** your `.env` file with anyone else!

---

## 6. Test the Connection

1. Open a terminal (or ask for help)
2. Run:
   ```
   python test_connection.py
   ```
3. You should see messages like:
   - `✅ Database connection successful!`
   - `✅ Table creation/verification successful!`
   - `🎉 All tests passed! Your database is ready to use.`

If you see errors, double-check your `.env` values.

---

## 7. Run the App!

1. In the terminal, run:
   ```
   streamlit run app.py
   ```
2. The app will open in your browser (usually at [http://localhost:8501](http://localhost:8501))
3. Try clocking in, clocking out, and using the manager dashboard!

---

## 💡 Need Help?
- Ask a friend or the developer for help if you get stuck
- Supabase has a friendly [Discord community](https://discord.supabase.com/)

---

**You did it! 🎉**

*Built for The Tythe Barn* 
