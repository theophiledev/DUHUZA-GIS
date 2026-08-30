# Duhuza — GIS, Real Estate & Multi-Vertical Platform (DUHUZA.RW)

Full-stack production platform for real estate, cadastral GIS land surveys, Isoko goods marketplace, certified service provider directory, and employment recruitment in Rwanda.

Contains a complete **Express + Prisma + PostGIS Backend API** and a **React + TypeScript + TailwindCSS / Custom Tokens Frontend**.

---

## 🏛️ Platform Architecture & Verticals

1. **🏠 Real Estate & Property**: Buy/rent listings with privacy engine (owner contact & exact GPS protected from public).
2. **🗺️ Cadastral GIS & Land Surveys**: Cadastral parcel demarcation, UPI mapping, boundary verification, and surveyor report downloads.
3. **🛒 Isoko Marketplace**: Self-serve marketplace for electronics, furniture, vehicles, and produce.
4. **🛠️ Certified Service Providers**: Directory of plumbers, electricians, drivers, and tradespeople.
5. **💼 Job Recruitment**: Employer vacancy postings, applicant tracking, and candidate management.

---

## 🛡️ Role-Based Access Control (RBAC) Suites

- **👑 Admin**: Platform KPIs, user management, and per-account permission overrides (`can_approve_property`, `can_approve_gis`, `can_approve_jobs`, `can_approve_market`, `can_approve_services`).
- **⚡ Manager**: 5-vertical moderation triage queue with 1-click approvals, surveyor dispatching, and feedback-required rejections.
- **📐 Agent / Surveyor**: Property portfolio management, manager review feedback alerts, and assigned GIS field survey missions with WhatsApp handoff.
- **👤 Client**: Self-serve hub for selling goods, posting jobs, tracking applications, and requesting land surveys with live visual stage tracker.

---

## 📂 Repository Structure

```
Duhuza/
├── backend/          Express + Prisma API (port 4000)
│   ├── src/          Routes, controllers, middleware, utils
│   ├── prisma/       Schema, migrations, seed
│   ├── tests/        Jest security & unit tests
│   └── package.json
├── frontend/         Vite + React / TypeScript UI (port 5173)
│   ├── src/          Components, pages, i18n, context, utils
│   └── package.json
├── Rwanda-locations.json   Administrative hierarchy data
└── README.md
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env          # Configure DATABASE_URL, JWT_SECRET
npx prisma migrate dev --name init
node prisma/seed.js           # Seeds default admin and reference records
npm run dev                   # http://localhost:4000
```

- API Health check: `GET http://localhost:4000/health`
- Run Backend Tests: `npm test`
#### OTHER DEVIVE TEST
Run commands manually next time:
cd C:\Users\USER\Desktop\Duhuza\backend
npm run dev
In another terminal:
cd C:\Users\USER\Desktop\Duhuza\frontend
npm run dev -- --host 0.0.0.0

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:4000
npm run dev                   # http://localhost:5173
```

- Build production bundle: `npm run build`

---

## 🌐 Trilingual Support
Fully localized in:
- 🇷🇼 **Kinyarwanda (`RW`)** (Default)
- 🇬🇧 **English (`EN`)**
- 🇹🇿 **Kiswahili (`SW`)**
