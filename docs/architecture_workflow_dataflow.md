# Duhuza Platform: Workflow & Data Flow Architecture

This document illustrates the end-to-end system architecture, role-based access control (RBAC) lifecycles, data flow security barriers (privacy engine), and multi-vertical workflows across **Duhuza**.

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
        MediaSuite["Media Uploader & Lightbox Gallery"]
        I18nEngine["Trilingual Localization (RW / EN / SW)"]
    end

    subgraph Security["🛡️ Security, Authentication & Gateway Layer"]
        AuthMiddleware["JWT Authentication (Bearer Tokens)"]
        RBACMiddleware["RBAC Role Guard & Granular Privilege Engine"]
        VisibilityEngine["Field Visibility & Privacy Engine (toPublicListing)"]
        JitterService["GPS Geo-Jittering Engine (0.5–1.5km Offset)"]
    end

    subgraph BackendAPI["⚙️ Backend Services (Express.js API on Port 4000)"]
        ListingService["🏠 Property & Real Estate Service"]
        GisService["🗺️ Cadastral GIS & Land Survey Service"]
        MarketService["🛒 Isoko Goods Marketplace Service"]
        JobsService["💼 Recruitment & Job Vacancies Service"]
        ServicesService["🛠️ Certified Trades & Services Service"]
        AdminService["👥 User Management & Audit Logger"]
    end

    subgraph Database["💾 Persistence & Geospatial Layer"]
        PostgresDB[("🐘 PostgreSQL + PostGIS Extension")]
        PrismaORM["⚡ Prisma ORM Data Access Client"]
        MediaFiles["📁 Media & PDF Report Storage"]
    end

    %% Connections
    PublicUser --> PublicApp
    ClientUser & AgentUser & ManagerUser & AdminUser --> DashboardShell
    PublicApp & DashboardShell --> AuthMiddleware
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

```mermaid
graph LR
    subgraph Roles["Role Hierarchy"]
        Admin["👑 ADMIN"]
        Manager["⚡ MANAGER"]
        Agent["📐 AGENT / SURVEYOR"]
        Client["👤 CLIENT"]
    end

    subgraph Permissions["Fine-Grained Privilege Overrides (FR3a)"]
        P1["can_approve_property"]
        P2["can_approve_gis"]
        P3["can_approve_jobs"]
        P4["can_approve_market"]
        P5["can_approve_services"]
    end

    Admin -->|Master Override / All True| Permissions
    Manager -->|Defaults: Property, Market, Services| P1 & P4 & P5
    Admin -->|Custom Grant/Revoke Override| Manager
    Agent -->|Manage own properties, field survey missions| Portfolios["Portfolio CRUD & Tasks"]
    Client -->|Self-serve listings, job applications, survey requests| ClientTasks["Self-Serve Hub"]
```

---

## 3. Real Estate Listing Lifecycle & Moderation Workflow

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Agent creates listing with private owner & exact GPS

    DRAFT --> PENDING_REVIEW: Agent clicks "Submit for Review" (POST /listings/:id/submit)
    
    state "Manager Triage Queue" as Triage {
        PENDING_REVIEW --> PUBLISHED: Manager approves (POST /manager/listings/:id/approve)
        PENDING_REVIEW --> REJECTED: Manager rejects with required comment (POST /manager/listings/:id/reject)
    }

    REJECTED --> DRAFT: Agent views manager feedback in dashboard & edits details
    PUBLISHED --> ARCHIVED: Property sold / rented / withdrawn
    
    PUBLISHED --> [*]: Visible to public with sanitized fields
    ARCHIVED --> [*]
```

---

## 4. Field Visibility & Anti-Scraping Data Flow Engine

This diagram illustrates how **BR3**, **BR8**, **FR13**, and **FR14** protect confidential owner data and exact GPS coordinates from public scraping:

```mermaid
sequenceDiagram
    autonumber
    actor PublicClient as 🌐 Public Client
    actor Agent as 📐 Agent (Owner)
    participant API as ⚙️ Express Backend
    participant VisEngine as 🛡️ Field Visibility Engine
    participant DB as 🐘 PostgreSQL / Prisma

    %% Agent Insertion
    Agent->>API: POST /api/listings (Full data with Owner Name, Phone, Private GPS)
    API->>DB: INSERT into listings with owner details & exact GPS coordinates
    DB-->>API: Listing Saved

    %% Public Query
    PublicClient->>API: GET /api/listings/:id
    API->>DB: Fetch listing record
    DB-->>API: Returns full record

    %% Sanitization Process
    Note over API,VisEngine: Privacy Engine (utils/fieldVisibility.js)
    API->>VisEngine: toPublicListing(internalListing, lang)
    
    VisEngine->>VisEngine: Strip ALWAYS_PRIVATE_FIELDS:<br/>• ownerName ❌<br/>• ownerPhone ❌<br/>• internalNotes ❌<br/>• exact privateLat/Lng ❌
    
    VisEngine->>VisEngine: Apply GPS Jittering (offset center by 0.5–1.5 km) 📍
    VisEngine->>VisEngine: Attach Multi-Language Translation (RW / EN / SW)
    VisEngine->>VisEngine: Inject WhatsApp Proxy / Contact Handoff URL
    
    VisEngine-->>API: Sanitized PublicListing DTO
    API-->>PublicClient: HTTP 200 (Safe Public Payload)
```

---

## 5. Cadastral GIS Land Survey Dispatch Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Client as 👤 Landowner / Client
    actor Manager as ⚡ Manager (Dispatcher)
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
    Surveyor->>API: PUT /api/gis/:id/progress { status: "COMPLETED", reportUrl: "..." }
    API->>DB: Save official Cadastral PDF Report URL
    
    Client->>API: GET /api/gis/mine
    API-->>Client: Survey Complete ✓ + Download Certified Report PDF
```

---

## 6. Multi-Vertical Data Entity Relationship (ERD)

```mermaid
erDiagram
    User ||--o{ Listing : "authors"
    User ||--o{ UserPermission : "has"
    User ||--o{ GisRequest : "requests"
    User ||--o{ MarketItem : "sells"
    User ||--o{ Job : "posts"
    User ||--o{ JobApplication : "applies"
    User ||--o| ServiceProvider : "operates"

    Listing ||--o{ ListingTranslation : "translates"
    Listing ||--o{ ListingMedia : "contains"
    Listing ||--o{ ListingStatusHistory : "tracks"
    Listing ||--o{ ListingFieldOverride : "configures"

    Job ||--o{ JobApplication : "receives"
    MarketItem ||--o{ MarketMedia : "displays"

    User {
        string id PK
        string name
        string email
        string phone
        string role "ADMIN | MANAGER | AGENT | CLIENT"
        string preferredLanguage "EN | RW | SW"
        boolean isActive
    }

    UserPermission {
        string id PK
        string userId FK
        string permissionKey
        string value "true | false"
    }

    Listing {
        string id PK
        string agentId FK
        string category "HOUSE | LAND | VEHICLE | MOTORCYCLE"
        string listingType "SALE | RENT"
        decimal price
        string currency
        decimal privateLat
        decimal privateLng
        string district
        string sector
        string cell
        string village
        string ownerName "CONFIDENTIAL"
        string ownerPhone "CONFIDENTIAL"
        string internalNotes "CONFIDENTIAL"
        string status "DRAFT | PENDING_REVIEW | PUBLISHED | REJECTED"
    }

    GisRequest {
        string id PK
        string userId FK
        string assignedAgentId FK
        decimal parcelLat
        decimal parcelLng
        string purpose
        string status "REQUESTED | ASSIGNED | IN_PROGRESS | COMPLETED"
        string reportUrl
    }
```
