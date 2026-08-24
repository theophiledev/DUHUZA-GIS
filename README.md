# Property Platform(DUHUZA.RW) API — MVP Scaffold

Backend scaffold for the SRS: multi-vertical property/rental platform with
agent → manager approval workflow, per-account privileges, field-visibility
engine, and WhatsApp lead handoff. Covers Phase 1 (property + rentals);
GIS and Jobs models are in the Prisma schema as stubs for Phase 2/3.

## What's implemented

| SRS Requirement | Where |
|---|---|
| FR1–FR3b: Auth, RBAC, per-account privileges | `middleware/auth.js`, `middleware/rbac.js`, `controllers/adminController.js` |
| FR4–FR7: Agent listing CRUD, own-only scope | `controllers/listingController.js` (`createListing`, `myListings`, `updateOwnListing`) |
| FR8–FR12: Manager approval workflow + status log | `controllers/managerController.js` |
| FR13–FR14, BR3, BR8: Field visibility engine | `utils/fieldVisibility.js` — **read this file first**, it's the core of the "clients don't see everything" requirement |
| FR15–FR19: Search/filter | `listingController.searchListings` |
| FR16: "Near me" geo search | Stubbed — needs `prisma.$queryRaw` with PostGIS `ST_DWithin`, see `prisma/POSTGIS_NOTE.sql` |
| FR20–FR22: WhatsApp handoff | `listingController.getWhatsappLink` |
| FR29–FR32: Multi-language | `ListingTranslation` model + `?lang=` query param, fallback logic in `fieldVisibility.js` |
| BR10: Agent can't see other agents' listings | Enforced in `myListings` and `updateOwnListing` — hard `agentId` filter, never trusts client input |
| BR11: Only Admin sets privileges | `adminRoutes.js` gated with `requireRole(['ADMIN'])` |

## Setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET
npx prisma migrate dev --name init
# then run prisma/POSTGIS_NOTE.sql manually against your DB (Prisma has
# no native GEOGRAPHY type)
node prisma/seed.js       # creates first Admin account
npm run dev
```

## What's intentionally left for you to build next

- **GIS module** (Phase 2): models exist (`GisRequest`), controllers/routes not yet written.
- **Jobs module** (Phase 3): models exist (`Job`, `JobApplication`), controllers/routes not yet written.
- **Geo "near me" search**: needs a raw SQL query using PostGIS — see comment in `searchListings`.
- **File/photo upload**: `mediaUrls` currently expects pre-uploaded URLs (e.g. from S3 presigned upload done client-side). Add an `/api/uploads` route if you want the API to handle the upload itself.
- **Notifications**: no email/SMS wired up yet — `requestPasswordReset` is a stub.
- **Input validation on GIS/manager edit routes**: `managerEditListing` currently trusts `req.body` fairly directly — tighten with a zod schema before production.
- **Tests**: none included — Section 13 of the SRS recommends Jest + Supertest, prioritizing tests that confirm `toPublicListing()` never leaks `ALWAYS_PRIVATE_FIELDS`.

## Folder structure

```
src/
  app.js              Express app + middleware wiring
  server.js           entry point
  config/db.js        Prisma client singleton
  middleware/
    auth.js            JWT verification
    rbac.js            role + per-account permission checks
    errorHandler.js
  utils/
    fieldVisibility.js  <- the "clients see limited fields" engine
    jitterLocation.js   <- public map pin offset from exact location
  controllers/
    authController.js
    listingController.js
    managerController.js
    adminController.js
  routes/
    authRoutes.js
    listingRoutes.js
    managerRoutes.js
    adminRoutes.js
    index.js
prisma/
  schema.prisma
  POSTGIS_NOTE.sql     manual migration for geography columns
  seed.js
```
