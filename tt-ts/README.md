# Employee Portal — The Tythe Barn (TypeScript)

TypeScript + React version of the Employee Portal. Uses the same Supabase PostgreSQL database as the Python/Streamlit app. Feature parity with the Streamlit version.

## Features

### Employee
- **Clock In/Out** — Log shifts with optional supervisor role
- **Pay Rates** — Standard (day), Enhanced (night 7PM–4AM BST), Supervisor
- **Personal Timesheet** — View your own entries with dates, times, pay breakdown, estimated pay
- **Export** — Export your timesheet to Excel or PDF

### Manager / Admin
- **View All Entries** — See time entries from all staff, grouped by employee
- **Add / Edit / Delete Shifts** — Add shifts manually, edit entries, remove incorrect data
- **Manage Users** — Create, edit, delete, activate/deactivate; set pay rates; reset password; promote to admin
- **Export** — Individual or bulk export (Excel/PDF) with pay amounts when rates are set
- **Audit Log** — View change history for manager actions
- **Quick Export** — One-click export all from the dashboard

### Auth
- Login, first-admin setup, change own password
- Roles: employee, manager, admin
- Session-based auth with optional CSRF protection

## Quick Start

### 1. Get Supabase Credentials

1. Open your [Supabase](https://supabase.com) project
2. Go to **Settings → Database**
3. Under **Connection string**, choose **Session pooler** (not direct)
4. Copy the URI or note: host, database, user, password, port

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase values:

```env
SUPABASE_HOST=aws-0-eu-west-1.pooler.supabase.com
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres.xxx
SUPABASE_PASSWORD=your-password
SUPABASE_PORT=5432

SESSION_SECRET=your-long-random-string
```

Optional: `SEED_MANAGER_USERNAME` and `SEED_MANAGER_PASSWORD` to auto-create the first admin when the users table is empty.

### 3. Install and Run

```bash
npm install
npm run dev
```

- **Client:** http://localhost:5173 (Vite dev server, proxies `/api` to server)
- **API:** http://localhost:3000

Open http://localhost:5173 in your browser. If no users exist, you’ll see the first-admin setup form.

## Build

```bash
npm run build
```

Builds the React client (Vite) and Express server (TypeScript → `dist-server/`).

## Production

```bash
npm run build
npm start
```

Serves the API and static client on port 3000.

**Required in production:**
- `SESSION_SECRET` — long random string; server will not start without it when `NODE_ENV=production`
- `SUPABASE_*` — database connection

**Optional:**
- `SESSION_STORE=memory|pg|redis` — defaults: dev=memory, prod=pg
- `DB_SSL_REJECT_UNAUTHORIZED=true` — for trusted CA/certificate chains
- `FIRST_SETUP_TOKEN` — require a one-time token for first-admin setup
- `SEED_MANAGER_USERNAME` / `SEED_MANAGER_PASSWORD` — seed first admin when users table is empty

## Project Structure

```
tt-ts/
├── src/
│   ├── client/          # React frontend
│   │   ├── pages/       # LoginPage, Layout, ManagerPage, etc.
│   │   ├── App.tsx
│   │   └── index.css
│   ├── server/          # Express backend
│   │   ├── auth/        # bcrypt, user auth
│   │   ├── db/          # Connection, repository
│   │   ├── middleware/  # auth, csrf, rateLimit
│   │   ├── routes/      # auth, clock, timesheet, users, export, shifts, audit
│   │   ├── services/    # timeTracking, exportService, exportUtils
│   │   └── index.ts
│   └── shared/          # Types, constants
├── public/              # Static assets (logos)
├── tests/               # Security / auth tests
├── .env.example
└── package.json
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, React Router
- **Backend:** Node.js, Express, TypeScript
- **Database:** Supabase (PostgreSQL) — same schema as Python app
- **Auth:** bcrypt, express-session, cookie-based
- **Export:** exceljs (Excel), pdfkit (PDF)

## Browser Support

- **Desktop:** Chrome, Firefox, Safari, Edge
- **Mobile:** Chrome, Safari 14+ (legacy build with polyfills for older Safari; Safari 16.6+ recommended for best experience)

The build includes a legacy bundle (`@vitejs/plugin-legacy`) for Safari 14–16.3. If you still see a regex error on very old Safari, use Chrome or upgrade to Safari 16.6+.

## Tests

```bash
npm run test:security
```

Runs authorization and auth-related tests.

---

**Employee Portal — The Tythe Barn** · Powered by Kari Suite
