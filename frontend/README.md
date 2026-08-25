# Duhuza Frontend

React + Vite + TypeScript + Tailwind CSS UI for the Duhuza Property Platform.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs at **http://localhost:5173**

## Environment

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | Backend API base URL |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |

## Features

- **Public:** Home, property search/filter, listing detail, market, services, jobs
- **Auth:** Client login/register (JWT in localStorage)
- **Roles:** Dashboards for CLIENT, AGENT, MANAGER, ADMIN
- **i18n:** Kinyarwanda-first (RW), English (EN), Kiswahili (SW)
- **WhatsApp:** Lead handoff buttons on listings, market, services

## Run with backend

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Ensure `backend/.env` has `FRONTEND_URL=http://localhost:5173` for CORS.
