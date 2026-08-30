# Dashboard UI/UX Development Plan
## Property Platform — Admin / Manager / Agent / Client Dashboards

**Prepared for:** BenTech Rwanda
**Scope:** Visual design system + phased build plan for the MVP dashboard scaffold already in `property-platform-web`

---

## 1. Design Goals

The dashboard is a **working tool**, not a marketing page — agents check it in the field on cheap Android phones under bright sunlight, managers triage approval queues quickly between other tasks, and the client wants it to feel credible for a real-estate/marketplace product handling people's money and property. Three goals drive every decision below:

1. **Scannable at a glance** — a manager clearing 30 pending items a day should never have to read a whole card to know its status.
2. **Legible outdoors, on mid-range Android screens, on 3G** — high contrast, no dependency on large images loading before the UI is usable.
3. **Consistent vocabulary** — the same word means the same thing everywhere (a button that says "Approve" always does the same action, never "Confirm" in one place and "Accept" in another).

This is *not* a landing page, so we don't need a bold hero moment — the discipline here is restraint, contrast, and one deliberate signature device (Section 3.4) rather than decoration.

### 1.1 Navigation Layout Decision

**Left sidebar (collapsible to icon-only) on desktop/tablet, bottom tab bar on mobile.** This was evaluated against a top-bar alternative and rejected for this system specifically, because:

- Nav depth varies a lot by role (Admin: 1 item, Manager: 3 queues, Client: 3 tabs, growing to include Jobs/GIS) — a sidebar absorbs that variability; a top bar runs out of horizontal room as modules are added.
- It stays visible while scrolling long approval queues/tables — a Manager scrolling 30 pending items never loses their nav.
- It matches the "back office tool" expectation of this user base (Managers/Admins expect a CRM-like pattern, not a consumer-app top bar) — the *public-facing* site (index.php) correctly keeps its own top bar, since browsing/marketing has different needs than an internal dashboard.
- Collapsible-to-icon-rail is the current standard in serious SaaS dashboards (Linear, Notion, Stripe) rather than a fixed-width 2015-era sidebar — this is what makes the choice read as modern, not just functional.

---

## 2. Design System

### 2.1 Color

| Token | Hex | Use |
|---|---|---|
| `primary` | `#0F766E` (deep teal) | Primary buttons, active nav item, links |
| `primary-dark` | `#0B5750` | Hover/pressed states |
| `accent` | `#F59E0B` (amber) | "Promoted" badge, price emphasis — used sparingly, never for more than one element per screen |
| `bg` | `#F7F9F8` | Page background |
| `surface` | `#FFFFFF` | Cards, tables, modals |
| `text-primary` | `#16241F` | Headings, body text |
| `text-secondary` | `#5B6B66` | Captions, metadata, placeholder text |
| `border` | `#E2E8E6` | Dividers, input borders |
| `success` | `#15803D` | Published / Approved / Successful payment |
| `warning` | `#B45309` | Pending review |
| `danger` | `#B91C1C` | Rejected / Suspended / Failed payment |
| `info` | `#1D4ED8` | Sold / Rented (a completed-but-neutral state) |

Why teal, not the generic AI-default cream+terracotta or dark+neon palette: it's a deliberate extension of the brand color already used in your SHAKAHANO and Rwanda Property Hub reference work, so the dashboard reads as the same product family as the public site, not a bolted-on admin tool.

### 2.2 Typography

| Role | Typeface | Notes |
|---|---|---|
| Headings (`h1`–`h3`) | **Sora** (Google Fonts) | Geometric, confident at large sizes — used for page titles and prices |
| Body / UI text | **Inter** | Best-in-class legibility at small sizes on low-DPI Android screens; strong Latin Extended coverage for Kinyarwanda diacritics |
| Data / IDs / transaction refs | **IBM Plex Mono**, small size only | Used only for things that are literally codes (listing IDs, MoMo transaction refs) — never for prose |

Type scale (rem, base 16px): `12 / 14 / 16 / 20 / 24 / 32` — headings use 24/32, body 14/16, captions/badges 12.

### 2.3 Spacing & Shape

- Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64px` — no arbitrary values outside this scale.
- Radius: `8px` cards/panels, `6px` inputs/buttons, `999px` (pill) badges.
- Shadows: `0 1px 2px rgba(0,0,0,.04)` resting cards, `0 8px 24px rgba(0,0,0,.10)` modals/dropdowns only — flat elsewhere. Heavy shadows read as dated.

### 2.4 Signature element: the status rail

Every card and table row that has a lifecycle status (listing, market item, service profile, transaction) gets a **4px colored left border** matching its status color (green/amber/red/blue/grey from 2.1) — visible even before you read a word. This is the one deliberate, consistent device that ties every screen together, and it directly serves goal #1 (scannable at a glance) rather than existing as decoration.

```
┌┃─────────────────────────────┐
┃┃ Modern Family House          │   ← green rail = Published
┃┃ Kicukiro · 85,000,000 RWF    │
└┃─────────────────────────────┘
```

---

## 3. Information Architecture (per role)

This matches the RBAC nav already built in `DashboardLayout.jsx` — the design plan formalizes what's already structurally correct:

```
ADMIN     → Users & Privileges
MANAGER   → Property Queue | Market Queue | Services Queue
AGENT     → My Listings
CLIENT    → My Market Items | My Service Profile | My Payments
```

No role ever sees a nav item for an action it can't perform — this was a functional requirement (RBAC) already; the design plan just makes sure the UI never implies otherwise (e.g. no greyed-out "Approve" button teasing a permission the user doesn't have — hide it, don't disable it, per Section 6).

---

## 4. Wireframes (ASCII, key screens)

### 4.1 Dashboard shell (desktop ≥1024px)
```
┌──────────────┬─────────────────────────────────────────┐
│ Property     │  My Listings                [+ New]      │
│ Platform     │                                            │
│ [AGENT]      │  ┌────────┬──────────┬──────────┬──────┐ │
│              │  │ Title  │ Category │ Status   │      │ │
│ My Listings  │  ├────────┼──────────┼──────────┼──────┤ │
│              │  │ ...    │ House    │ ●Pending │ [..] │ │
│              │  └────────┴──────────┴──────────┴──────┘ │
│              │                                            │
│ [«Collapse]  │                                            │
│ [Log out]    │                                            │
└──────────────┴─────────────────────────────────────────┘
```
The `[«Collapse]` toggle at the bottom of the sidebar shrinks it to a 64px icon-only rail (below), for users who want more table width. Choice is remembered per user via `localStorage` so it doesn't reset every session.

### 4.1b Icon rail (collapsed sidebar, desktop/tablet)
```
┌────┬──────────────────────────────────────────────┐
│ 🏠 │  My Listings                        [+ New]    │
│    │                                                 │
│ 📋 │  ┌────────┬──────────┬──────────┬──────┐      │
│    │  │ Title  │ Category │ Status   │      │      │
│ »  │  ├────────┼──────────┼──────────┼──────┤      │
│    │  │ ...    │ House    │ ●Pending │ [..] │      │
│ ⏻  │  └────────┴──────────┴──────────┴──────┘      │
└────┴──────────────────────────────────────────────┘
```
Icons only, no text labels — a tooltip on hover shows the label. This is the **default state on tablet** (768–1023px, less width to spare) and an **opt-in state on desktop** via the collapse toggle.

### 4.2 Mobile (≤768px) — sidebar collapses to a bottom tab bar
```
┌─────────────────────────────┐
│  My Listings          [+]    │
│  ┌─────────────────────────┐│
│  │┃ House Kicukiro           ││   ← status rail visible on the card
│  │┃ 85,000,000 RWF  ●Pending││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │┃ Land Musanze             ││
│  │┃ 18,000,000 RWF  ●Published││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  [Listings] [Profile] [Out]  │  ← bottom nav, role-specific icons
└─────────────────────────────┘
```
Table → card transformation below 768px is mandatory, not optional — Agents are the role most likely to be on a phone in the field, and an HTML table squeezed into 360px is unusable.

### 4.3 Manager review card (the highest-frequency screen)
```
┌┃──────────────────────────────┐
┃┃ Modern Family House            │
┃┃ 85,000,000 RWF                 │
┃┃ Kicukiro · submitted 2h ago    │
┃┃                                 │
┃┃ [Approve]   [Reject]           │
└┃──────────────────────────────┘
```
Approve is the primary-colored button (teal); Reject is secondary/outline — not red. Red is reserved for the *result* of a rejection (the badge), not the *action* button, so the queue doesn't look alarming at a glance.

### 4.4 Empty and error states
Per the writing principles below, every empty state is an invitation to act, not a dead end:
- Agent, no listings yet: *"No listings yet. Create your first one to get started."* + the same `+ New Listing` button, not a separate generic message.
- Manager, empty queue: *"Nothing pending — you're caught up."* (positive framing, not "No data").
- Manager queue load error (403, missing permission): *"You don't have permission to review this queue. Ask an Admin to grant it."* — names the actual cause and the actual fix, doesn't just say "Error."

---

## 5. Component Inventory

Build these once as shared components, use everywhere — this is what turns 4 separate dashboards into one coherent product:

| Component | Used by | Key states |
|---|---|---|
| `<StatusBadge status="PUBLISHED">` | all | maps status → color from 2.1, pill shape |
| `<DataTable>` | Admin, Agent | collapses to `<CardList>` below 768px (4.2) |
| `<ReviewCard>` | Manager | status rail, Approve/Reject actions |
| `<EmptyState message="" actionLabel="" onAction="">` | all | see 4.4 |
| `<FormPanel>` | Admin, Agent, Client | consistent label/input/error spacing |
| `<ConfirmDialog>` | Admin (suspend), Manager (reject) | reject requires a comment field inline, not a separate step |

Right now the scaffold uses ad hoc `<table className="data-table">` and `<form className="panel-form">` per page — Phase 1 below is exactly turning these into the shared components in this table.

---

## 6. Interaction & Microcopy Rules

(Applying the writing discipline from the design brief to this specific product.)

- **Same word, same action, everywhere.** "Approve" never becomes "Confirm" or "Accept" on a different screen. "Submit for review" is the only phrase for moving Draft → Pending, on Agent, Market, and Services forms alike.
- **Buttons say the result, not the mechanism.** "Save as Draft", not "Submit" (submit implies it's final, which a draft isn't). "Approve" toasts "Approved", not "Success."
- **Hide actions the user can't take — never show a disabled button with no explanation.** A Manager without `can_approve_market` should not see a greyed-out Approve button on a market item; they shouldn't see the Market Queue nav item at all if they have zero market permissions, or should see the plain permission-denied message from 4.4 if they somehow land there.
- **Errors name the fix.** "Rejection comment is required" not "Invalid request." "Agent has no phone on file — add one before publishing" not "422 error."
- **Numbers are never ambiguous.** Always `85,000,000 RWF`, never a bare `85000000` — currency and thousands separators are not optional polish, they're correctness for a product about people's money.

---

## 7. Accessibility Baseline (non-negotiable, not a stretch goal)

- Color is never the only signal — the status rail (3.4) is always paired with the text badge label, for colorblind users.
- All interactive elements reachable and operable by keyboard; visible focus ring (`2px solid var(--primary)`) on every button/input/link.
- Minimum contrast: body text 4.5:1, large text/icons 3:1 — verify the amber accent (`#F59E0B`) against white background specifically, as amber-on-white often fails at small sizes; use it only on dark or bordered surfaces if a contrast check fails.
- Form errors announced via `aria-live="polite"` region, not just a colored border.
- Touch targets minimum 44×44px on the mobile card views (4.2) — agents are often tapping one-handed outdoors.

---

## 8. Responsive Breakpoints

| Breakpoint | Range | Layout change |
|---|---|---|
| Mobile | < 768px | Sidebar replaced entirely by bottom tab bar (4.2) — icon rail doesn't work well at 360px width, so we switch patterns rather than shrink further |
| Tablet | 768–1023px | Sidebar **defaults to collapsed icon rail** (4.1b) — screen width is tighter, prioritize table space; user can expand it |
| Desktop | ≥ 1024px | Sidebar **defaults to full width** (4.1) with text labels; user can collapse to icon rail (4.1b) via the toggle if they want more table width |

Collapse/expand state is per-user, stored in `localStorage`, and independent per breakpoint band — a user who collapses on desktop isn't forced into that state on tablet, since tablet already defaults to collapsed for different reasons (space, not preference).

---

## 9. Tooling Recommendation

The current scaffold uses hand-written CSS classes (`data-table`, `panel-form`, `badge`). Recommendation for this phase:

- **Keep plain CSS, but restructure it around CSS custom properties** for the tokens in Section 2 (`--color-primary`, `--space-4`, etc.) rather than adopting Tailwind mid-project — introducing a new build dependency isn't worth it for a scaffold this size, and hand-rolled tokens are easier for you to teach/reason about given your UI Design lecturing background.
- If the component count grows past ~15–20 (likely once Jobs/GIS UI is added), revisit Tailwind or a lightweight component library at that point — not before.

---

## 10. Phased Build Plan

### Phase 1 — Design tokens + shared components (3–4 days)
1. Create `src/styles/tokens.css` with all Section 2 variables.
2. Build `<StatusBadge>`, `<EmptyState>`, `<ConfirmDialog>` as real shared components (currently inlined per-page).
3. Refactor `DashboardLayout` sidebar to support:
   - a collapse toggle (full ↔ icon rail) on desktop, persisted to `localStorage`
   - default-collapsed icon rail on tablet (768–1023px)
   - full replacement with a bottom tab bar below 768px (separate component, not a CSS-only transform of the sidebar — the interaction pattern is different enough to warrant its own component)
   - an icon per nav item now, since the icon rail needs one regardless of collapse state (pick a consistent icon set — e.g. Lucide, already used elsewhere in the ecosystem — rather than mixing emoji and SVG)

### Phase 2 — Table → Card responsive pattern (2–3 days)
4. Build `<DataTable>` wrapper that renders `<table>` ≥768px and `<CardList>` below it — apply to Admin's user table and Agent's listings table first (highest-traffic screens).
5. Apply the status-rail signature (3.4) to `ReviewCard` (Manager) and the new card view.

### Phase 3 — Microcopy + empty/error state pass (1–2 days)
6. Audit every button label and error message against Section 6's rules — this is a text-only pass, no new components.
7. Implement the specific empty-state copy from Section 4.4 across all four dashboards.

### Phase 4 — Accessibility pass (1–2 days)
8. Keyboard-navigate every screen manually; fix focus order and missing focus rings.
9. Run a contrast checker on the full palette, especially amber-on-white; adjust if needed.
10. Add `aria-live` regions to all form error displays.

### Phase 5 — Usability check with real users (ongoing)
11. Sit with one real Agent and one real Manager (or the closest available stand-ins) and watch them complete: post a listing, approve/reject an item, without guidance. Note every point of hesitation — that's your backlog, not a hypothesis.

**Total estimated effort:** 7–11 focused days before the dashboard is ready to hand to the client as a polished deliverable, on top of the already-working MVP scaffold.

---

## Appendix: What NOT to change right now

- Don't introduce a component library (MUI, Ant Design, shadcn) mid-scaffold — it would fight the existing plain-CSS structure and cost more time than it saves at this size.
- Don't add page-load animations or transitions yet — Section 1's goals (scannable, works on 3G) are better served by instant renders than motion polish. Revisit only after Phase 5 usability feedback, if at all.
- Don't redesign the color palette per-role — one consistent system across Admin/Manager/Agent/Client is what makes it feel like one product instead of four disconnected tools.
