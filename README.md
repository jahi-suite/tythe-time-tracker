# Employee Portal — The Tythe Barn

A web-based time tracking system for employees to clock in/out and for managers to view, manage, and export timesheets. Built for The Tythe Barn with branding from [Kari Suite](https://kari.suite).

## Features

### Employee Features
- **Clock In/Out** — Log shifts with optional supervisor role
- **Pay Rates** — Automatic Standard (day), Enhanced (night), and Supervisor rates
- **Personal Timesheet** — View your own time entries with dates, times, pay breakdown, and estimated pay
- **Export** — Export your timesheet to Excel or PDF

### Manager Features
- **User Management** — Create and manage employee/manager accounts; set pay rates (£/hr) per user
- **All Entries View** — See time entries from all staff
- **Add / Edit / Delete** — Add shifts manually, edit entries, remove incorrect data
- **Export** — Export any employee's timesheet or all staff (Excel/PDF) with pay amounts when rates are set
- **Audit Log** — View change history for manager actions
- **Quick Export** — One-click export all from the dashboard

## Quick Start

### 1. Set Up Supabase Database

1. Create a project at [Supabase](https://supabase.com)
2. Go to Settings → Database for connection details
3. For Streamlit Cloud, use **Session pooler** (not direct connection)

### 2. Configure Secrets

Use `.env` locally or Streamlit Cloud secrets. Structure:

```toml
[SUPABASE]
HOST = "your-pooler-host.supabase.com"
DATABASE = "postgres"
USER = "postgres.xxx"
PASSWORD = "your-password"
PORT = "5432"

MANAGER_PASSWORD = "tythe2024"
```

**First manager account:** When no accounts exist, the login page shows a "Set up your admin account" form. Enter username, display name, and password — no secrets editing required. Optional: use `SEED_MANAGER_USERNAME` and `SEED_MANAGER_PASSWORD` in secrets for automated setup.

### 3. Install and Run

```bash
pip install -r requirements.txt
streamlit run app.py
```

App runs at `http://localhost:8501`

## Deployment (Streamlit Cloud)

1. Push to GitHub
2. Connect repo at [Streamlit Cloud](https://streamlit.io/cloud)
3. Add secrets (Settings → Secrets) in TOML format
4. Use **Session pooler** host from Supabase for IPv4 compatibility

See `STREAMLIT_CLOUD_DATABASE.md` for step-by-step setup.

## Usage

### Employees
1. Log in with your username and password
2. Go to **Employee Clock In/Out** to clock in/out
3. Use **Personal Timesheet** to view your history
4. Use **Export Timesheet** to download your data

### Managers
1. Log in with your manager account
2. **Manager Dashboard** — View all entries, add/edit/delete shifts, manage users
3. **Export Timesheet** — Export individual or all staff (Excel/PDF)
4. **Change Log** tab — View audit history of manager actions

## Tech Stack

- **Frontend**: Streamlit
- **Database**: Supabase (PostgreSQL)
- **Auth**: bcrypt, user accounts with roles (employee/manager)
- **Export**: openpyxl (Excel), ReportLab (PDF)

## Project Structure

```
tythe_time_tracker/
├── ui/           # Streamlit pages and components
├── core/         # Services, auth, models
├── database/     # Connection, repository, init
├── config/       # Settings
└── static/       # Logos (Tythe, Kari)
```

## Contributing

This is an MVP for The Tythe Barn. For questions or improvements, contact the development team.

---

**Employee Portal — The Tythe Barn** · Powered by Kari Suite
