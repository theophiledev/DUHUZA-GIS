# Duhuza Platform: Workflow & Data Flow Architecture

This document illustrates the end-to-end system architecture, role-based access control (RBAC) lifecycles, data flow security barriers (privacy engine), and multi-vertical workflows across **Duhuza**.

> **Last updated:** 2026-09-01 — reflects current codebase state: auth password-reset OTP flows, full Listing status lifecycle (SOLD/RENTED/WITHDRAWN/EXPIRED), MTN MoMo Payments module, ListingFieldVisibility, WhatsappClickLog, ListingAttribute, public/private GPS dual-field architecture, and full frontend route tree.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Clients["🌐 Client & User Presentation Layer"]
        PublicUser["👤 Public Visitor / Buyer / Jobseeker"]
        ClientUser["👤 Client (Seller, Employer, Landowner)"]
        AgentUser["📐 Agent / Licensed Surveyor"]
        ManagerUser["⚡ Manager (Moderator / Dispatcher)"]
        AdminUser["👑 System Administrator"]
    end

    subgraph Frontend["💻 Frontend Application (React + TypeScript + Vite + TailwindCSS)"]
        PublicApp["Public Portal & Vertical Directories"]
        DashboardShell["Role-Themed Dashboard Shell (DashboardLayout)"]
        MediaSuite["Media Uploader & Lightbox Gallery (MediaUploader, ImageLightbox)"]
        I18nEngine["Trilingual Localization (RW / EN / SW)"]
        ReviewsUI["ReviewsAndComments — Manager feedback display"]
    end

    subgraph Security["🛡️ Security, Authentication & Gateway Layer"]
        AuthMiddleware["JWT Authentication (Bearer Tokens — 7d expiry)"]
        RateLimiter["Rate Limiter (express-rate-limit — auth & password-reset)"]
        RBACMiddleware["RBAC Role Guard & Granular Privilege Engine (requireRole / requirePermission)"]
        VisibilityEngine["Field Visibility & Privacy Engine (toPublicListing)"]
        JitterService["GPS Geo-Jittering Engine (0.5–1.5km Offset → publicLat/publicLng)"]
    end

    subgraph BackendAPI["⚙️ Backend Services (Express.js API on Port 4000)"]
        AuthService["🔐 Auth & Profile Service (JWT, OTP Password Reset)"]
        ListingService["🏠 Property & Real Estate Service"]
        GisService["🗺️ Cadastral GIS & Land Survey Service"]
        MarketService["🛒 Isoko Goods Marketplace Service"]
        JobsService["💼 Recruitment & Job Vacancies Service"]
        ServicesService["🛠️ Certified Trades & Services Service"]
        PaymentsService["💳 MTN MoMo Promotion Payments Service (Phase 3)"]
        AdminService["👥 User Management & Audit Logger"]
        ManagerService["⚡ Multi-Vertical Moderation & Dispatch Service"]
    end

    subgraph Database["💾 Persistence & Geospatial Layer"]
        PostgresDB[("🐘 PostgreSQL + PostGIS Extension")]
        PrismaORM["⚡ Prisma ORM Data Access Client (v5)"]
        MediaFiles["📁 Media & PDF Report Storage"]
    end

    %% Connections
    PublicUser --> PublicApp
    ClientUser & AgentUser & ManagerUser & AdminUser --> DashboardShell
    PublicApp & DashboardShell --> RateLimiter
    RateLimiter --> AuthMiddleware
    AuthMiddleware --> RBACMiddleware
    RBACMiddleware --> BackendAPI

    BackendAPI --> PrismaORM
    PrismaORM --> PostgresDB
    BackendAPI --> MediaFiles

    BackendAPI --> VisibilityEngine
    VisibilityEngine --> JitterService
    VisibilityEngine --> PublicApp
```

---

## 2. RBAC & Granular Privilege Matrix

The `requirePermission()` middleware checks per-account `UserPermission` overrides first, then falls back to role defaults. Admin always bypasses all permission checks.

```mermaid
graph LR
    subgraph Roles["Role Hierarchy"]
        Admin["👑 ADMIN"]
        Manager["⚡ MANAGER"]
        Agent["📐 AGENT / SURVEYOR"]
        Client["👤 CLIENT"]
    end

    subgraph Permissions["Manager Role Defaults (FR3a — Admin can override per-account)"]
        P1["can_approve_property ✅ ON"]
        P2["can_approve_gis ❌ OFF"]
        P3["can_approve_jobs ❌ OFF"]
        P4["can_approve_market ✅ ON"]
        P5["can_approve_services ✅ ON"]
    end

    Admin -->|Master Override — all permissions true| Permissions
    Manager -->|Defaults shown — Admin can grant/revoke per account| P1 & P4 & P5
    Admin -->|Custom per-account grant/revoke via UserPermission row| Manager
    Agent -->|Manage own listings, field survey missions| Portfolios["Portfolio CRUD & GIS Tasks"]
    Client -->|Self-serve: market items, job posts, applications, GIS requests, service profile| ClientTasks["Self-Serve Hub"]
```

> **Note:** Manager defaults for `can_approve_gis` and `can_approve_jobs` are **false** — only ADMIN or a Manager with an explicit `UserPermission` override can action GIS assignments and job approvals.

---

## 3. Real Estate Listing Lifecycle & Moderation Workflow

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Agent creates listing with private owner and exact GPS

    DRAFT --> PENDING_REVIEW: Agent submits for review POST /api/listings/:id/submit

    state "Manager Triage Queue (MANAGER or ADMIN)" as Triage {
        PENDING_REVIEW --> PUBLISHED: Manager approves with optional comment POST /api/manager/listings/:id/approve
        PENDING_REVIEW --> REJECTED: Manager rejects with required comment POST /api/manager/listings/:id/reject
    }

    REJECTED --> DRAFT: Agent views rejection feedback and edits listing

    PUBLISHED --> SOLD: Property sold PUT /api/manager/listings/:id/status
    PUBLISHED --> RENTED: Property rented
    PUBLISHED --> WITHDRAWN: Owner or agent withdraws
    PUBLISHED --> EXPIRED: Listing expires

    SOLD --> [*]
    RENTED --> [*]
    WITHDRAWN --> [*]
    EXPIRED --> [*]
    DRAFT --> [*]
```

> Every status transition is logged in `ListingStatusHistory` (who, when, old→new, optional comment) — FR12.

---

## 4. Authentication & Password Reset Flows

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User
    participant API as ⚙️ Express Backend
    participant DB as 🐘 PostgreSQL / Prisma
    participant ResetStore as 🗂️ In-Memory OTP Store

    Note over User,API: Registration — CLIENT only (Agents/Managers created by Admin via FR1)
    User->>API: POST /api/auth/register { name, email|phone, password }
    API->>DB: CREATE user (role: CLIENT, preferredLanguage: EN)
    API-->>User: 201 { token JWT-7d, user }

    Note over User,API: Login
    User->>API: POST /api/auth/login { identifier, password }
    API->>DB: Find user by email OR phone
    API->>API: bcrypt.compare(password, passwordHash)
    API-->>User: { token, user } OR 401/403 if account suspended (FR3b)

    Note over User,API: Password Reset — 3-step OTP flow
    User->>API: POST /api/auth/forgot-password { identifier }
    API->>DB: Lookup user by email or phone (case-insensitive)
    API->>ResetStore: Store { code 6-digit, userId, expiresAt+15min }
    API-->>User: { message, resetCode } — code returned in dev/local

    User->>API: POST /api/auth/verify-reset-code { identifier, code }
    API->>ResetStore: Validate code and expiry
    API-->>User: { valid: true } OR 400

    User->>API: POST /api/auth/reset-password { identifier, code, newPassword }
    API->>ResetStore: Re-validate code
    API->>DB: UPDATE user.passwordHash (bcrypt 12 rounds)
    API->>ResetStore: DELETE consumed code
    API-->>User: { message: Password has been reset successfully }
```

---

## 5. Field Visibility & Anti-Scraping Data Flow Engine

This diagram illustrates how **BR3**, **BR8**, **FR13**, and **FR14** protect confidential owner data and exact GPS coordinates from public scraping. Note the **dual-GPS architecture**: `privateLat`/`privateLng` (exact, stored in DB — never serialized publicly) vs `publicLat`/`publicLng` (jittered 0.5–1.5 km, stored and safely served):

```mermaid
sequenceDiagram
    autonumber
    actor PublicClient as 🌐 Public Client
    actor Agent as 📐 Agent (Owner)
    participant API as ⚙️ Express Backend
    participant VisEngine as 🛡️ Field Visibility Engine
    participant DB as 🐘 PostgreSQL / Prisma

    %% Agent Insertion
    Agent->>API: POST /api/listings (ownerName, ownerPhone, privateLat, privateLng, ...)
    API->>VisEngine: jitterLocation(privateLat, privateLng) → publicLat/publicLng
    API->>DB: INSERT with privateLat/Lng AND publicLat/publicLng stored separately
    DB-->>API: Listing Saved

    %% Public Query
    PublicClient->>API: GET /api/listings/:id
    API->>DB: Fetch listing with translations, media, attributes, fieldVisibility
    DB-->>API: Returns full record

    %% Sanitization Process
    Note over API,VisEngine: Privacy Engine (utils/fieldVisibility.js)
    API->>VisEngine: toPublicListing(internalListing, lang)

    VisEngine->>VisEngine: Strip ALWAYS_PRIVATE_FIELDS:<br/>• ownerName ❌<br/>• ownerPhone ❌<br/>• internalNotes ❌<br/>• privateLat / privateLng ❌<br/>• agentId ❌ (proxy via WhatsApp link only)

    VisEngine->>VisEngine: Apply ListingFieldVisibility manager overrides (FR14)
    VisEngine->>VisEngine: Resolve translation (requested lang → fallback to first available)
    VisEngine->>VisEngine: Filter media — only isPublic=true entries
    VisEngine->>VisEngine: Build attributes map (exclude attr: keys marked private)
    VisEngine->>VisEngine: Inject whatsappLinkAvailable=true (raw phone never exposed)

    VisEngine-->>API: Sanitized PublicListing DTO (uses publicLat/publicLng)
    API-->>PublicClient: HTTP 200 (Safe Public Payload)
```

---

## 6. Cadastral GIS Land Survey Dispatch Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Client as 👤 Landowner / Client
    actor Manager as ⚡ Manager (Dispatcher — requires can_approve_gis permission)
    actor Surveyor as 📐 Certified Surveyor (Agent)
    participant API as ⚙️ Duhuza API
    participant DB as 🐘 Database

    Client->>API: POST /api/gis (Parcel Coordinates, UPI Number, Survey Purpose)
    API->>DB: Create GisRequest (status: REQUESTED)
    
    Manager->>API: GET /api/manager/gis/pending
    API-->>Manager: Pending Survey Requests Queue
    
    Manager->>API: POST /api/manager/gis/:id/assign { agentId }
    API->>DB: Update GisRequest (status: ASSIGNED, assignedAgentId)
    
    Surveyor->>API: GET /api/agent/gis/mine
    API-->>Surveyor: Field Mission (Parcel GPS, UPI, Client Phone)
    
    Note over Surveyor,Client: Direct WhatsApp contact & on-site RTK field boundary survey 📐
    
    Surveyor->>API: PUT /api/gis/:id/progress { status: "IN_PROGRESS" }
    Surveyor->>API: PUT /api/gis/:id/progress { status: "COMPLETED", reportUrl: "...", boundaryGeoJson: {...} }
    API->>DB: Save Cadastral PDF Report URL + GeoJSON boundary polygon

    Client->>API: GET /api/gis/mine
    API-->>Client: Survey Complete ✓ + Download Certified Report PDF
```

---

## 7. Manager Approval Feedback Workflow

This diagram shows how managers can provide optional approval comments that are visible to users in the public reviews section:

```mermaid
sequenceDiagram
    autonumber
    actor Agent as 📐 Agent / Seller / Employer
    actor Manager as ⚡ Manager (Approver)
    actor Public as 🌐 Public / Buyer / Applicant
    participant API as ⚙️ Duhuza API
    participant DB as 🐘 Database
    participant Frontend as 💻 Frontend UI

    Agent->>API: POST /api/listings/:id/submit → PENDING_REVIEW
    API->>DB: Update status to PENDING_REVIEW

    Manager->>API: GET /api/manager/listings/pending
    API-->>Manager: Approval Queue

    alt Manager Approves with Optional Feedback
        Manager->>API: POST /api/manager/listings/:id/approve { comment?: "..." }
        API->>DB: Atomic tx: UPDATE status=PUBLISHED + INSERT ListingStatusHistory row
    else Manager Rejects with Required Reason (BR6 — comment min 3 chars)
        Manager->>API: POST /api/manager/listings/:id/reject { comment: "..." }
        API->>DB: Atomic tx: UPDATE status=REJECTED + INSERT ListingStatusHistory row
    end

    Public->>API: GET /listings/:id (detail page)
    API->>DB: Fetch listing + approvalComment
    API-->>Public: Return listing data

    Public->>Frontend: Load detail page
    Frontend->>Frontend: Display ReviewsAndComments component
    
    Note over Frontend: Manager approval comment displayed<br/>with special styling at top of reviews<br/>- Green "Manager Feedback" badge<br/>- Always visible regardless of filters
    
    Frontend-->>Public: ✓ Manager feedback visible to community
```

---

## 9. Multi-Vertical Data Entity Relationship (ERD)

```mermaid
erDiagram
    User ||--o{ Listing : "authors AgentListings"
    User ||--o{ UserPermission : "has AccountPermissions"
    User ||--o{ UserPermission : "grants GrantedByAdmin"
    User ||--o{ ListingStatusHistory : "changes status"
    User ||--o{ GisRequest : "requests ClientGisRequests"
    User ||--o{ GisRequest : "assigned to survey AssignedSurveyor"
    User ||--o{ MarketItem : "sells Seller"
    User ||--o{ Job : "posts Employer"
    User ||--o{ JobApplication : "applies Applicant"
    User ||--o| ServiceProvider : "operates ProviderProfile"
    User ||--o{ Transaction : "pays PayingUser"

    Listing ||--o{ ListingTranslation : "translates"
    Listing ||--o{ ListingMedia : "contains"
    Listing ||--o{ ListingAttribute : "has attributes"
    Listing ||--o{ ListingStatusHistory : "tracks history"
    Listing ||--o{ ListingFieldVisibility : "configures field overrides FR14"
    Listing ||--o{ WhatsappClickLog : "logs contact clicks"

    Job ||--o{ JobApplication : "receives"
    MarketItem ||--o{ MarketItemMedia : "displays"

    User {
        string id PK
        string name
        string email "unique optional"
        string phone "unique optional"
        string passwordHash
        string role "ADMIN | MANAGER | AGENT | CLIENT"
        string preferredLanguage "EN | RW | SW default RW"
        boolean isActive "FR3b Admin can suspend"
        datetime createdAt
        datetime updatedAt
    }

    UserPermission {
        string id PK
        string userId FK
        string permissionKey "e.g. can_approve_property, can_approve_gis"
        string value "true | false parsed in app layer"
        string grantedById FK "Admin who granted the override"
        datetime updatedAt
    }

    Listing {
        string id PK
        string agentId FK
        string category "HOUSE | LAND | VEHICLE | MOTORCYCLE"
        string listingType "SALE | RENT"
        decimal price
        string currency "default RWF"
        float publicLat "jittered — safe to expose"
        float publicLng "jittered — safe to expose"
        string district
        string sector
        string cell
        string village
        float privateLat "CONFIDENTIAL exact GPS"
        float privateLng "CONFIDENTIAL exact GPS"
        string ownerName "CONFIDENTIAL"
        string ownerPhone "CONFIDENTIAL"
        string internalNotes "CONFIDENTIAL"
        string status "DRAFT|PENDING_REVIEW|APPROVED|PUBLISHED|REJECTED|SOLD|RENTED|WITHDRAWN|EXPIRED"
    }

    GisRequest {
        string id PK
        string clientId FK "landowner who made the request"
        string assignedAgentId FK "nullable assigned surveyor"
        float parcelLat
        float parcelLng
        string purpose
        string status "REQUESTED | ASSIGNED | IN_PROGRESS | COMPLETED"
        json boundaryGeoJson "GeoJSON polygon from field survey"
        string reportUrl "Cadastral PDF URL"
        datetime createdAt
        datetime updatedAt
    }

    MarketItem {
        string id PK
        string sellerId FK
        string category
        string title
        decimal price
        string currency
        string status "PENDING_REVIEW | PUBLISHED | REJECTED | SOLD"
        boolean isPromoted "set true only after verified MoMo callback FR43"
        datetime promotedUntil
        string approvalComment "Manager feedback on approval"
    }

    ServiceProvider {
        string id PK
        string userId FK "unique one-to-one with User"
        string category "plumbing, tutoring, transport, tailoring..."
        string description
        string rateInfo "free text e.g. 5000 RWF/hour"
        string coverageDistrict
        string coverageSector
        string status "PENDING_REVIEW | PUBLISHED | REJECTED"
        boolean isPromoted
        datetime promotedUntil
        string approvalComment "Manager approval feedback"
        datetime createdAt
        datetime updatedAt
    }

    Job {
        string id PK
        string employerId FK
        string title
        string description
        string location
        string salaryRange
        datetime deadline
        string status "PENDING_REVIEW | PUBLISHED | REJECTED | CLOSED"
        string approvalComment "Manager approval feedback"
        datetime createdAt
    }

    JobApplication {
        string id PK
        string jobId FK
        string clientId FK
        string cvUrl
        datetime appliedAt
        string status "default submitted"
    }

    MarketItemMedia {
        string id PK
        string marketItemId FK
        string url
        int sortOrder
    }

    ListingAttribute {
        string id PK
        string listingId FK
        string key "e.g. bedrooms engine_cc land_size_sqm"
        string value
    }

    ListingFieldVisibility {
        string id PK
        string listingId FK
        string fieldName "field name or attr:key"
        boolean isPublic "Manager override FR14"
    }

    WhatsappClickLog {
        string id PK
        string listingId FK
        datetime clickedAt
        string clientIpHash "hashed for analytics not raw IP"
    }

    Transaction {
        string id PK
        string userId FK
        string referenceType "LISTING | MARKET_ITEM | SERVICE | JOB"
        string referenceId "id of item being promoted"
        decimal amount
        string currency "default RWF"
        string momoTransactionRef "unique set after MoMo request"
        string status "PENDING | SUCCESSFUL | FAILED"
        datetime initiatedAt
        datetime confirmedAt "set only on verified MoMo callback BR14"
    }
```

---

## 10. Frontend Route Tree & Role-Protected Navigation

```mermaid
graph TD
    Root["/  Layout"]
    Root --> Public["Public Routes no auth required"]
    Root --> Guest["Guest-only Routes redirect if logged in"]
    Root --> Dashboard["/dashboard ProtectedRoute any authenticated user"]

    Public --> Home["/  HomePage"]
    Public --> Listings["/listings  ListingsPage"]
    Public --> ListingDetail["/listings/:id  ListingDetailPage"]
    Public --> GisPublic["/gis  GisPage info and request"]
    Public --> Market["/market  MarketPage"]
    Public --> MarketDetail["/market/:id  MarketDetailPage"]
    Public --> Services["/services  ServicesPage"]
    Public --> Jobs["/jobs  JobsPage"]
    Public --> JobDetail["/jobs/:id  JobDetailPage"]

    Guest --> Login["/login  LoginPage"]
    Guest --> Register["/register  RegisterPage"]
    Guest --> ForgotPwd["/forgot-password  ForgotPasswordPage OTP flow"]
    Guest --> ResetPwd["/reset-password  ForgotPasswordPage reused"]

    Dashboard --> Profile["/dashboard/profile  ProfilePage"]
    Dashboard --> AgentRoutes["AGENT only /dashboard/agent"]
    Dashboard --> ManagerRoutes["MANAGER or ADMIN /dashboard/manager"]
    Dashboard --> ClientRoutes["CLIENT only /dashboard/client"]
    Dashboard --> AdminRoutes["ADMIN only /dashboard/admin"]

    AgentRoutes --> AgentDash["AgentDashboard"]
    AgentRoutes --> AgentListings["AgentListingsPage"]
    AgentRoutes --> AgentListingNew["AgentListingFormPage create"]
    AgentRoutes --> AgentListingEdit["AgentListingFormPage edit id"]
    AgentRoutes --> AgentGis["AgentGisPage assigned missions"]

    ManagerRoutes --> ManagerDash["ManagerDashboard"]
    ManagerRoutes --> ManagerListings["ManagerListingsPage property moderation"]
    ManagerRoutes --> ManagerMarket["ManagerMarketPage Isoko moderation"]
    ManagerRoutes --> ManagerServices["ManagerServicesPage services moderation"]
    ManagerRoutes --> ManagerGis["ManagerGisPage GIS assignment"]
    ManagerRoutes --> ManagerJobs["ManagerJobsPage job moderation"]

    ClientRoutes --> ClientDash["ClientDashboard"]
    ClientRoutes --> ClientMarket["ClientMarketPage own items"]
    ClientRoutes --> ClientMarketNew["ClientMarketFormPage create item"]
    ClientRoutes --> ClientJobs["ClientJobsPage own posts"]
    ClientRoutes --> ClientJobNew["ClientJobFormPage create post"]
    ClientRoutes --> ClientApps["ClientApplicationsPage"]
    ClientRoutes --> ClientGis["ClientGisPage GIS requests"]
    ClientRoutes --> ClientService["ClientServicePage own service profile"]

    AdminRoutes --> AdminDash["AdminDashboard"]
    AdminRoutes --> AdminUsers["AdminUsersPage all users and permissions"]
    AdminRoutes --> AdminCreateUser["AdminCreateUserPage create Agent Manager Admin"]
```

---

## 11. API Endpoint Registry

| Module | Method | Path | Auth | Permission |
|---|---|---|---|---|
| **Auth** | POST | `/api/auth/register` | — | — |
| | POST | `/api/auth/login` | — | rate-limited |
| | POST | `/api/auth/forgot-password` | — | rate-limited |
| | POST | `/api/auth/verify-reset-code` | — | rate-limited |
| | POST | `/api/auth/reset-password` | — | rate-limited |
| | GET | `/api/auth/profile` | JWT | — |
| | PUT | `/api/auth/profile` | JWT | — |
| | POST | `/api/auth/change-password` | JWT | — |
| **Listings** | GET | `/api/listings` | — | public |
| | POST | `/api/listings` | JWT | AGENT |
| | GET | `/api/listings/:id` | — | public sanitized |
| | PUT | `/api/listings/:id` | JWT | owner/AGENT |
| | POST | `/api/listings/:id/submit` | JWT | AGENT |
| | GET | `/api/listings/:id/whatsapp-link` | — | — |
| **Manager – Listings** | GET | `/api/manager/listings/pending` | JWT | can_approve_property |
| | POST | `/api/manager/listings/:id/approve` | JWT | can_approve_property |
| | POST | `/api/manager/listings/:id/reject` | JWT | can_approve_property |
| | PUT | `/api/manager/listings/:id/status` | JWT | can_approve_property |
| | POST | `/api/manager/listings/:id/reassign` | JWT | can_approve_property |
| | PUT | `/api/manager/listings/:id` | JWT | can_approve_property |
| **Manager – Market** | GET | `/api/manager/market/pending` | JWT | can_approve_market |
| | POST | `/api/manager/market/:id/approve` | JWT | can_approve_market |
| | POST | `/api/manager/market/:id/reject` | JWT | can_approve_market |
| **Manager – Services** | GET | `/api/manager/services/pending` | JWT | can_approve_services |
| | POST | `/api/manager/services/:id/approve` | JWT | can_approve_services |
| | POST | `/api/manager/services/:id/reject` | JWT | can_approve_services |
| **Manager – GIS** | GET | `/api/manager/gis/pending` | JWT | can_approve_gis |
| | POST | `/api/manager/gis/:id/assign` | JWT | can_approve_gis |
| **Manager – Jobs** | GET | `/api/manager/jobs/pending` | JWT | can_approve_jobs |
| | POST | `/api/manager/jobs/:id/approve` | JWT | can_approve_jobs |
| | POST | `/api/manager/jobs/:id/reject` | JWT | can_approve_jobs |
| **GIS** | POST | `/api/gis` | JWT | CLIENT |
| | GET | `/api/gis/mine` | JWT | CLIENT |
| | GET | `/api/agent/gis/mine` | JWT | AGENT |
| | PUT | `/api/gis/:id/progress` | JWT | AGENT |
| **Market** | GET | `/api/market` | — | public |
| | POST | `/api/market` | JWT | CLIENT |
| | GET/PUT/DELETE | `/api/market/:id` | JWT | owner |
| **Services** | GET | `/api/services` | — | public |
| | POST | `/api/services` | JWT | CLIENT |
| | GET/PUT/DELETE | `/api/services/:id` | JWT | owner |
| **Jobs** | GET | `/api/jobs` | — | public |
| | POST | `/api/jobs` | JWT | CLIENT |
| | GET/PUT/DELETE | `/api/jobs/:id` | JWT | owner |
| | POST | `/api/jobs/:id/apply` | JWT | CLIENT |
| **Payments** | POST | `/api/payments/momo/callback` | MTN sig BR14 | — |
| | POST | `/api/payments/momo/request` | JWT | — |
| | GET | `/api/payments/mine` | JWT | — |
| **Admin** | GET | `/api/admin/users` | JWT | ADMIN |
| | POST | `/api/admin/users` | JWT | ADMIN |
| | PUT | `/api/admin/users/:id/permissions` | JWT | ADMIN |
| | PUT | `/api/admin/users/:id/status` | JWT | ADMIN |
