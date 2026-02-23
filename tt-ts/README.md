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

## Browser Support

Mobile: use Chrome or Safari 16.6+ (older Safari may fail to load).
