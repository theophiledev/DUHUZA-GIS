# Duhuza Backend API

Express + Prisma API for the multi-vertical property/rental platform with agent → manager approval workflow, field-visibility engine, and WhatsApp lead handoff.

## Setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET
npx prisma migrate dev --name init
# then run prisma/POSTGIS_NOTE.sql manually against your DB
node prisma/seed.js       # creates first Admin account
npm run dev               # http://localhost:4000
```

## API overview

| Module | Base path | Notes |
|---|---|---|
| Auth | `/api/auth` | Client self-register; agents/managers created by admin |
| Listings | `/api/listings` | Public search; agent CRUD |
| Manager | `/api/manager` | Approval queues (listings, market, services, GIS, jobs) |
| Admin | `/api/admin` | User management, permissions |
| Market | `/api/market` | Isoko self-serve marketplace |
| Services | `/api/services` | Provider registration |
| GIS | `/api/gis` | Parcel survey requests |
| Jobs | `/api/jobs` | Job board and applications |
| Payments | `/api/payments` | MTN MoMo (stubbed for dev) |

Health: `GET /health`

## Folder structure

```
backend/
  src/
    app.js              Express app + middleware wiring
    server.js           entry point
    config/db.js        Prisma client singleton
    middleware/         auth, rbac, errorHandler
    utils/              fieldVisibility, jitterLocation
    controllers/        route handlers
    routes/             API route definitions
  prisma/
    schema.prisma
    POSTGIS_NOTE.sql
    seed.js
  tests/
```

## Tests

```bash
npm test
```

## CORS

The API allows requests from the frontend dev server. Set `FRONTEND_URL` in `.env` (default `http://localhost:5173`).
