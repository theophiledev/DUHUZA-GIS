# Duhuza Comment System Architecture Analysis

## Executive Summary

The Duhuza platform currently has **NO persistent backend comment system**. Reviews are stored only in browser localStorage (frontend mock data). Manager approval uses a status history audit trail but lacks a proper comment/feedback mechanism for agents. This document outlines the current architecture and what needs to be implemented for manager-approval-visible comments.

---

## 1. Current Comment Model Structure

### 1.1 Frontend Comment Model (ReviewsAndComments.tsx)

**Interface:**
```typescript
export interface ReviewItem {
  id: string;
  authorName: string;
  authorRole?: string;        // e.g., "Verified Buyer", "Manager", "Agent"
  rating: number;             // 1-5 stars
  comment: string;
  createdAt: string;          // ISO 8601
  tags?: string[];           // e.g., "Verified Quality", "Fast Response"
  helpfulCount: number;       // user vote count
  isVerified?: boolean;       // trust indicator
}
```

**Storage**: Browser `localStorage` only
- Key format: `duhuza_reviews_${itemType}_${itemId}`
- No backend persistence
- No database model

### 1.2 Backend Status History Model (for Listings only)

**Prisma Model:**
```prisma
model ListingStatusHistory {
  id          String        @id @default(uuid())
  listingId   String
  listing     Listing       @relation(fields: [listingId], references: [id], onDelete: Cascade)
  changedById String
  changedBy   User          @relation("StatusChangedBy", fields: [changedById], references: [id])
  oldStatus   ListingStatus?
  newStatus   ListingStatus
  comment     String?       // Single comment per status change
  changedAt   DateTime      @default(now())

  @@map("listing_status_history")
}
```

**Usage**: 
- Tracks WHO changed status, WHEN, and WHY
- `comment` field currently used only for **rejection reasons** (required per BR6)
- Audit trail for compliance/transparency

### 1.3 Backend Gap: Market Items & Services

**Current State:**
- Market items and Service providers have `status` field but NO status history table
- Manager can reject but comment is NOT persisted
- Code comment: "add a market_item_status_history table...before relying on this for real moderation audit trails"

---

## 2. Where Comments Are Stored & Retrieved

### 2.1 Database Storage (Listings Only)

| Table | Column | Purpose | Current Status |
|-------|--------|---------|-----------------|
| `listing_status_history` | `comment` | Rejection reason only | ✅ Implemented |
| `listings` | `internalNotes` | Private notes (not for agent feedback) | ✅ Implemented |
| `listing_field_visibility` | (N/A) | Controls field exposure, not comments | ✅ Implemented |

**API Endpoints:**
- None explicitly for comments
- Status changes via: `POST /manager/listings/:id/approve`, `POST /manager/listings/:id/reject`
- Rejection comment passed in request body: `{ comment: "..." }`

### 2.2 Frontend Storage (All Items)

**Component:** `frontend/src/components/ReviewsAndComments.tsx`

**Storage Method:**
```javascript
const storageKey = `duhuza_reviews_${itemType}_${itemId}`;
localStorage.setItem(storageKey, JSON.stringify(reviews));
```

**Retrieval:**
```javascript
const [reviews, setReviews] = useState<ReviewItem[]>(() => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
  } catch { /* fallback */ }
  return defaultBaselineReviews;  // Mock data hardcoded
});
```

**Items Using ReviewsAndComments:**
- Listings (`ListingDetailPage.tsx`)
- Market items (`MarketDetailPage.tsx`)
- Services (`ServicesPage.tsx`)
- Jobs (`JobDetailPage.tsx`)

---

## 3. Manager Approval Workflow - Current Implementation

### 3.1 Listing Approval Flow (BR12, FR8-FR11)

```
AGENT                          MANAGER
  │                              │
  ├─ Create Draft ────────────────┤
  │  (status: DRAFT)              │
  │                               │
  ├─ Submit for Review ────────────┤
  │  (status: PENDING_REVIEW)      │
  │                               │
  │       ┌─────────────────────────┤
  │       │ Manager reviews listing │
  │       │ + rejects with comment  │
  │       └─────────────────────────┤
  │                               │
  ├─ Can re-edit if REJECTED ─────┤
  │  (status: DRAFT)              │
  │                               │
  ├─ Re-submit ───────────────────┤
  │  (status: PENDING_REVIEW)      │
  │                               │
  │       ┌──────────────────────────┤
  │       │ Manager approves         │
  │       │ (status: PUBLISHED)      │
  │       └──────────────────────────┤
  │                                 │
  └──────────────────────────────────┤
```

### 3.2 Approval Status Fields by Vertical

**Listings:**
```
DRAFT → PENDING_REVIEW → {APPROVED, PUBLISHED, REJECTED}
                          └─→ SOLD, RENTED, WITHDRAWN, EXPIRED
```

**Market Items:**
```
PENDING_REVIEW → {PUBLISHED, REJECTED, SOLD}
```

**Services:**
```
PENDING_REVIEW → {PUBLISHED, REJECTED}
```

**Jobs:**
```
PENDING_REVIEW → {PUBLISHED, REJECTED, CLOSED}
```

### 3.3 Current Manager Actions & Comments

| Action | Endpoint | Comment Handling | Status |
|--------|----------|------------------|--------|
| Approve Listing | `POST /manager/listings/:id/approve` | No comment | ✅ Implemented |
| Reject Listing | `POST /manager/listings/:id/reject` | **Required** (3+ chars) | ✅ Implemented |
| Change Status | `PUT /manager/listings/:id/status` | Optional comment | ✅ Implemented |
| Edit Listing | `PUT /manager/listings/:id` | No comment field | ✅ Implemented |
| Approve Market | `POST /manager/market/:id/approve` | No storage | ⚠️ Partial |
| Reject Market | `POST /manager/market/:id/reject` | Requested but not saved | ⚠️ Partial |

### 3.4 Manager Edit Permissions (FR9 - Edit-then-Approve)

**Current Capability:**
- Manager can fully edit any pending listing
- Changes don't require agent re-submission
- No comment explaining what changed
- `managerEditListing()` endpoint accepts arbitrary fields

---

## 4. Where Comments Are Displayed in Frontend

### 4.1 Public Display (ReviewsAndComments Component)

**Locations:**
1. **Listing Detail Page** → [frontend/src/pages/ListingDetailPage.tsx](frontend/src/pages/ListingDetailPage.tsx#L202)
   ```tsx
   <ReviewsAndComments
     itemId={listing.id}
     itemType="listing"
     itemTitle={listing.title}
   />
   ```

2. **Market Detail Page** → [frontend/src/pages/MarketDetailPage.tsx](frontend/src/pages/MarketDetailPage.tsx#L162)

3. **Services Page** → [frontend/src/pages/ServicesPage.tsx](frontend/src/pages/ServicesPage.tsx#L191)

4. **Job Detail Page** → [frontend/src/pages/JobDetailPage.tsx](frontend/src/pages/JobDetailPage.tsx#L98)

### 4.2 Review Display Features

**Current UI Elements:**
- Star rating (1-5) with visual stars
- Average rating calculation
- Rating distribution histogram
- Filter by star rating
- Sort options: recent, highest, lowest
- "Helpful" vote count per review
- Verified badges
- Tags (e.g., "Fast Delivery", "Professional")
- Author name and role display

**Mock Data Examples:**
```typescript
{
  id: 'rev-1',
  authorName: 'Emmanuel Mugabo',
  authorRole: 'Verified Buyer',
  rating: 5,
  comment: 'Visite ku mutungo yagenze neza cyane...',
  createdAt: '2026-08-25T14:20:00Z',
  tags: ['Verified Inspection', 'Accurate UPI', 'Recommended'],
  helpfulCount: 6,
  isVerified: true,
}
```

### 4.3 Manager/Agent View - NOT Implemented

**What's Missing:**
- No "Manager Comments" section in listing detail
- Status history not displayed to agents
- Rejection feedback not shown in UI
- No audit trail visibility

---

## 5. Current Comment Visibility Logic

### 5.1 Public Listing Visibility (BR2)

**Rule:** Only `PUBLISHED` listings return to public API

**Code:**
```javascript
// searchListings() - listingController.js
const where = {
  status: 'PUBLISHED',  // BR2 — hard filter
  ...otherFilters
};
```

**Effect:**
- Draft/Pending/Rejected listings never reach clients
- Reviews only shown on public listings
- Agent sees their drafts but clients don't

### 5.2 Field-Level Visibility (FR14)

**Manager Override Table:**
```prisma
model ListingFieldVisibility {
  id        String  @id @default(uuid())
  listingId String
  fieldName String  // e.g., "ownerPhone", "internalNotes"
  isPublic  Boolean
  
  @@unique([listingId, fieldName])
}
```

**Hard Blocks (ALWAYS_PRIVATE_FIELDS):**
- `privateLat`, `privateLng` (exact GPS - always hidden)
- `ownerPhone`, `ownerName` (always hidden to public)
- `internalNotes` (never exposed)
- `agentId`, `fieldVisibility` (system fields)

**Code Example:**
```javascript
const toPublicListing = (listing, lang) => {
  const publicListing = { ...listing };
  
  // Remove always-private fields
  for (const field of ALWAYS_PRIVATE_FIELDS) {
    delete publicListing[field];
  }
  
  return publicListing;
};
```

### 5.3 Review Visibility - Current Logic

**Frontend Logic:**
1. All reviews in localStorage shown to anyone (no auth check)
2. No role-based filtering
3. Mock "Verified" badges hardcoded
4. No distinction between user types

**Backend Logic:**
- No API for comments exists
- No role-based comment filtering
- No approval status on reviews

---

## 6. Approval/Visibility Fields - Current State

### 6.1 Listing Status Field

```prisma
enum ListingStatus {
  DRAFT             // Agent only sees this
  PENDING_REVIEW    // Manager reviews
  APPROVED          // (deprecated - maps to PUBLISHED)
  PUBLISHED         // Public-facing
  REJECTED          // Agent sees reason in status history
  SOLD              // Lifecycle state
  RENTED            // Lifecycle state
  WITHDRAWN         // Lifecycle state
  EXPIRED           // Lifecycle state
}
```

### 6.2 Other Models' Status

**Market Items:**
```prisma
enum ListingLiteStatus {
  PENDING_REVIEW
  PUBLISHED
  REJECTED
  SOLD
}
```

**Services:**
```prisma
enum ListingLiteStatus {
  PENDING_REVIEW
  PUBLISHED
  REJECTED
}
```

### 6.3 Role-Based Access Control (RBAC)

**Current Permission Keys:**
- `can_approve_property` → Manager can approve listings
- `can_approve_market` → Manager can approve market items
- `can_approve_services` → Manager can approve services
- `can_approve_gis` → Manager can assign GIS requests
- `can_approve_jobs` → Manager can approve jobs

**Routes:**
```javascript
// managerRoutes.js
router.post('/listings/:id/approve', 
  requirePermission('can_approve_property'), 
  ctrl.approveListing
);
router.post('/listings/:id/reject', 
  requirePermission('can_approve_property'), 
  ctrl.rejectListing
);
```

---

## 7. What's Missing for Manager Comment Visibility

### 7.1 Database Schema Gaps

**Missing Table:**
```prisma
model ListingComment {
  id              String   @id @default(uuid())
  listingId       String
  listing         Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  authorId        String
  author          User     @relation(fields: [authorId], references: [id])
  
  content         String   @db.Text
  isManagerComment Boolean @default(false)
  
  // Approval workflow tracking
  approvalStatus  String   @default("visible")  // or "pending", "archived"
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([listingId])
  @@index([authorId])
}
```

**Missing for Market/Services:**
- `MarketItemStatusHistory` (noted as TODO in controller)
- `ServiceProviderStatusHistory`

### 7.2 API Endpoint Gaps

**Not Implemented:**
- `GET /listings/:id/comments` - retrieve comment thread
- `POST /listings/:id/comments` - add comment (manager only)
- `GET /listings/:id/status-history` - full approval audit trail
- `GET /markets/:id/status-history` - market approval history
- `GET /services/:id/status-history` - service approval history

### 7.3 Frontend Display Gaps

**Not Implemented:**
- Manager comments section in listing detail
- Status history timeline view
- Rejection feedback display to agent
- "Resubmit Notes" from manager visible to agent
- Comment threading (multi-comment conversations)

### 7.4 Test Gaps

**Current Tests:** [backend/tests/](backend/tests/)
- `authPasswordReset.test.js`
- `fieldVisibility.test.js`

**Missing Tests:**
- Comment creation and retrieval
- Comment visibility by role
- Status history accuracy
- Manager rejection feedback display

---

## 8. Recommended Implementation Plan

### Phase 1: Database Schema
1. Add `ListingComment` model to Prisma
2. Add audit trail tables for Market/Services/Jobs
3. Add comment approval status field
4. Migration scripts

### Phase 2: Backend API
1. Comment CRUD endpoints
2. Comment visibility queries by role
3. Status history retrieval
4. Manager approval workflow updates

### Phase 3: Frontend Display
1. Comments section in listing detail
2. Manager comments UI (only for agents/managers)
3. Status history timeline
4. Comment form for managers

### Phase 4: Testing & Polish
1. E2E tests for comment workflow
2. Permission validation tests
3. UI/UX refinement

---

## 9. Key Code Locations Reference

| Component | File | Purpose |
|-----------|------|---------|
| **Schema** | [backend/prisma/schema.prisma](backend/prisma/schema.prisma) | Data models |
| **Status History** | [backend/src/controllers/managerController.js](backend/src/controllers/managerController.js#L91) | `changeStatus()` function |
| **Approval Routes** | [backend/src/routes/managerRoutes.js](backend/src/routes/managerRoutes.js) | Manager endpoints |
| **Reviews Frontend** | [frontend/src/components/ReviewsAndComments.tsx](frontend/src/components/ReviewsAndComments.tsx) | Review display component |
| **Listing Detail** | [frontend/src/pages/ListingDetailPage.tsx](frontend/src/pages/ListingDetailPage.tsx#L12) | Listing view with reviews |
| **RBAC** | [backend/src/middleware/rbac.js](backend/src/middleware/rbac.js) | Permission checking |
| **Field Visibility** | [backend/src/utils/fieldVisibility.js](backend/src/utils/fieldVisibility.js) | Public field filtering |

---

## 10. Summary: Current vs. Required

| Feature | Current | Required |
|---------|---------|----------|
| Comment Storage | localStorage (client-side) | Database backend |
| Manager Feedback | Single rejection reason | Comment thread system |
| Approval Audit Trail | Listings only | All verticals |
| Comment API | None | Full CRUD |
| Frontend Display | Generic reviews, no approval context | Manager comments panel |
| Role-based Visibility | No | Yes (agents see feedback, public doesn't) |
| Status History View | Backend data exists | Frontend timeline UI |

---

**Next Steps:** Use this analysis to design the comment approval visibility system that tracks what managers communicate to agents throughout the review process.
