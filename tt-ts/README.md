# Tythe Time Tracker — TypeScript

TypeScript + React migration of the Employee Portal. Uses the same Supabase database as the Python/Streamlit app.

## Setup

```bash
cp .env.example .env
# Edit .env with your Supabase credentials

npm install
```

## Development

```bash
npm run dev
```

- Client: http://localhost:5173
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
