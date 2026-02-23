# Tythe Time Tracker — TypeScript

TypeScript + React migration of the Employee Portal. Uses the same Supabase database as the Python/Streamlit app. Feature parity with the Streamlit version.

## Features

- **Auth:** Login, first-admin setup, change password, roles (employee/manager/admin)
- **Employee:** Clock in/out, supervisor role, personal timesheet, export (Excel/PDF)
- **Manager:** View all entries, add/edit/delete shifts, manage users, audit log, bulk export

## Setup

```bash
cp .env.example .env
# Edit .env with your Supabase credentials (same as Python app)

npm install
```

## Development

```bash
npm run dev
```

- Client: http://localhost:5173 (Vite dev server with API proxy)
- API: http://localhost:3000

## Build

```bash
npm run build
```

Builds both client (Vite) and server (TypeScript).

## Production

```bash
npm run build
npm start
```

Serves the API and static client on port 3000.
`SESSION_SECRET` must be set in production (`NODE_ENV=production`) or the server will fail to start.
Session storage defaults to `memory` in development and `pg` in production (`SESSION_STORE=memory|pg|redis`).
`SESSION_STORE=pg` requires `connect-pg-simple`; `SESSION_STORE=redis` requires `redis` + `connect-redis` and `REDIS_URL`.
Database SSL certificate validation defaults to `rejectUnauthorized: false` for Supabase pooler compatibility.
Set `DB_SSL_REJECT_UNAUTHORIZED=true` when using a trusted CA/certificate chain and a compatible Postgres endpoint.
Optionally set `FIRST_SETUP_TOKEN` to require a one-time shared token for `POST /api/auth/first-setup` while the users table is empty.

## Browser Support

Mobile: use Chrome or Safari 16.6+ (older Safari may fail to load).
