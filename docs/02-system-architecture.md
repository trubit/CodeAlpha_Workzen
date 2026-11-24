# WORKZEN — Complete System Architecture Specification

**Product:** WORKZEN  
**Category:** Enterprise Project Management & Team Collaboration SaaS  
**Tagline:** *"Plan Smarter. Work Together. Achieve More."*  
**Architecture Tier:** Enterprise Multi-Tenant Modular Monolith  

---

## 1. Unified Repository & Codebase Structure

Workzen strictly adheres to the **Unified Full-Stack Repository Pattern**:
- Exactly **one root package.json** and **one package-lock.json**.
- Exactly **one root .env** and **one .env.example**.
- **Zero nested package.json** files in subdirectories.
- Shared contracts, types, and validation schemas in `src/shared/`.
- Strict frontend and backend separation under `src/client/` and `src/server/`.

### Directory Tree

```
workzen/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Continuous Integration workflow (Lint, Typecheck, Build)
├── docs/
│   ├── 01-project-assessment.md       # 14-point forensic assessment & findings
│   ├── 02-system-architecture.md      # Full-stack system & repo architecture
│   ├── 03-database-and-multitenancy.md# Mongoose schema catalog & tenant isolation
│   ├── 04-auth-and-security.md        # Authentication, authorization & security architecture
│   ├── 05-architecture-diagrams.md    # 9 comprehensive Mermaid diagrams
│   └── 06-phase1-completion-report.md # Phase 1 delivery report
├── src/
│   ├── shared/                        # Shared contracts between frontend and backend
│   │   ├── constants/                 # Status enums, role definitions, permission keys
│   │   ├── types/                     # Core TypeScript interfaces for all 23 entities
│   │   └── validation/                # Zod validation schemas for requests/responses
│   ├── server/                        # Node.js + Express + TypeScript Backend
│   │   ├── config/                    # DB, JWT, Cloudinary, Stripe, Paystack configs
│   │   ├── controllers/               # HTTP request handlers & response envelopes
│   │   ├── middleware/                # Auth, TenantContext, RBAC, RateLimit, ErrorHandler
│   │   ├── models/                    # Mongoose schemas with compound tenant indexes
│   │   ├── routes/                    # Express router definitions versioned at /api/v1
│   │   ├── services/                  # Business logic, tenant isolation & transactions
│   │   ├── socket/                    # Socket.IO real-time event handlers & rooms
│   │   ├── utils/                     # Token generators, password hashers, logger
│   │   └── index.ts                   # Express server bootstrap & HTTP/WS listener
│   └── client/                        # React 18 + Vite + MUI + Bootstrap Frontend
│       ├── assets/                    # Logos, brand assets, icons
│       ├── components/
│       │   ├── common/                # Badges, Buttons, LoadingSpinners, Avatars
│       │   ├── layout/                # Shell, Sidebar, Header, Breadcrumbs, TenantSwitcher
│       │   └── modals/                # TaskModal, ProjectModal, MemberInviteModal
│       ├── pages/                     # 13 high-fidelity enterprise prototype screens
│       │   ├── LandingPage.tsx        # Public marketing & conversion portal
│       │   ├── LoginPage.tsx          # Dual JWT + OTP login interface
│       │   ├── RegisterPage.tsx       # Org & workspace onboarding flow
│       │   ├── EnterpriseDashboard.tsx# Multi-org executive metrics & portfolio health
│       │   ├── OrganisationDashboard.tsx# Org department summary & capacity
│       │   ├── WorkspaceDashboard.tsx # Workspace sprint overview & activity stream
│       │   ├── ProjectOverview.tsx    # Project milestones, progress & burn-down
│       │   ├── KanbanBoard.tsx        # Multi-column drag-ready task board
│       │   ├── TaskDetailsPage.tsx    # Rich metadata, subtasks, logs & comments
│       │   ├── TeamManagementPage.tsx # Org & workspace member roles & invitations
│       │   ├── NotificationCentre.tsx # Filterable real-time alerts & mentions
│       │   ├── CalendarPage.tsx       # Timeline, sprint deadlines & schedules
│       │   └── SettingsPage.tsx       # Org profile, billing, security & audit logs
│       ├── store/                     # Zustand state store (active tenant, auth state)
│       ├── theme/                     # MUI Theme provider & Bootstrap integration
│       ├── types/                     # Client UI types & navigation definitions
│       ├── App.tsx                    # Root routing & layout container
│       ├── index.html                 # Single page application entry HTML
│       └── main.tsx                   # Client bootstrap mounting React to DOM
├── .dockerignore
├── .env                               # Local development environment secrets
├── .env.example                       # Documented environment template
├── .gitignore
├── docker-compose.yml                 # Local multi-container setup (App + MongoDB)
├── Dockerfile                         # Production multi-stage Docker build
├── package.json                       # Central root package manifest
├── package-lock.json                  # Deterministic dependency lock
├── tsconfig.json                      # Client & shared TypeScript configuration
├── tsconfig.server.json               # Server TypeScript build configuration
└── vite.config.ts                     # Vite build & proxy configuration
```

---

## 2. Complete Frontend Architecture

### Technology Foundation
- **UI Framework:** React 18 with TypeScript.
- **Build Tool:** Vite 6 (ultra-fast HMR and optimized tree-shaken production bundles).
- **Styling & Component Libraries:**
  - **Material UI (MUI v6):** Used for sophisticated data inputs, date pickers, dialogs, avatar groups, menus, tooltips, and badges.
  - **Bootstrap 5.3 & React-Bootstrap:** Used for fluid grid layouts, responsive containers, flex utilities, and card structures.
  - **Custom Enterprise Theme:** A high-end Slate & Indigo color palette (`#4F46E5` primary, `#0F172A` background slate, `#10B981` success emerald, `#F59E0B` warning amber).
  - **Zero Tailwind CSS, Zero Redux, Zero Next.js**.
- **Client State Management:**
  - **Zustand:** Lightweight, zero-boilerplate store for global client concerns (active organization, active workspace, active view, theme mode, notification badge count).
  - **TanStack Query (React Query v5):** Robust server-state management handling background synchronization, automatic re-fetching on window focus, optimistic UI updates, and stale-while-revalidate caching.
- **Form & Input Validation:**
  - **Zod:** Unified schema validation shared directly with backend contracts.
  - Client forms validate input synchronously with real-time field error messaging.

### Layout & Navigation Architecture
- **Responsive Shell (`AppLayout`):**
  - Collapsible **Sidebar Navigation** with multi-level nesting:
    - Tenant Selector (Switch active Organisation & Workspace).
    - Primary Navigation: Enterprise Dashboard, Organisation, Workspace, Projects, Kanban, Calendar, Team, Notifications, Settings.
    - User Profile Card with quick sign-out and status indicator.
  - Sticky **Top Navigation Bar (`Header`)**:
    - Global Search (`Ctrl + K` ready).
    - Quick Action Button (`+ Create Task / Project`).
    - Real-Time Notification Bell with unread badge counter.
    - Help & Documentation shortcuts.
  - **Breadcrumbs Bar:** Dynamically reflects current hierarchy (`Workzen > Acme Corp > Engineering > Core Platform > Sprint 12`).

---

## 3. Complete Backend Architecture

### Design Pattern
The backend is structured as an **Enterprise Layered Controller-Service-Repository Monolith** built on Express.js and TypeScript:

```
[ HTTP Request / WebSocket Event ]
               │
               ▼
       [ Express Middlewares ]
  ├── CORS & Helmet Headers
  ├── Rate Limiter (express-rate-limit)
  ├── Authentication Guard (JWT Verification)
  ├── Multi-Tenant Context Guard (Extracts organisationId)
  └── Zod Schema Validation Guard
               │
               ▼
          [ Controller ]
  ├── Unpacks request params & body
  ├── Invokes domain service
  └── Returns standardized ResponseEnvelope
               │
               ▼
         [ Service Layer ]
  ├── Pure Business Logic
  ├── Tenant Isolation Boundary (Enforces organisationId matching)
  ├── Permission Checks (RBAC & PBAC)
  └── Multi-document Transactions
               │
               ▼
     [ Mongoose Data Access ]
  ├── Pre-indexed collection queries
  ├── Safe projections
  └── Audit log dispatch
```

### Route Organization & API Versioning
All REST endpoints are strictly organized and prefixed under `/api/v1`:
- `/api/v1/auth`: Registration, Login, Refresh, OTP Verification, Password Reset.
- `/api/v1/organisations`: Org management, settings, invitation dispatch.
- `/api/v1/workspaces`: Workspace lifecycle, member assignments.
- `/api/v1/projects`: Project definitions, milestones, workflow columns.
- `/api/v1/tasks`: Task CRUD, status updates, assignees, subtasks, dependencies.
- `/api/v1/comments`: Task discussions, threaded responses.
- `/api/v1/teams`: Team grouping, department allocation.
- `/api/v1/notifications`: Real-time user alert feed, read status.
- `/api/v1/billing`: Stripe & Paystack subscriptions, checkout sessions, webhook handlers.
- `/api/v1/audit-logs`: Enterprise compliance and activity history.

### Standardized Response Envelope
All API endpoints return a typed, predictable JSON structure:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

### Real-Time Socket.IO Architecture
- **Tenant-Scoped Rooms:**
  - `org:${organisationId}` — For organization-wide announcements and audit alerts.
  - `workspace:${workspaceId}` — For workspace-level task counters and board updates.
  - `project:${projectId}` — For real-time Kanban board updates (card moved, assignee changed).
  - `user:${userId}` — For personal notifications, direct mentions, and security alerts.
- **WebSocket Handshake Authentication:**
  - Socket connection requests require a valid JWT token in `handshake.auth.token`.
  - The middleware verifies the token and binds `socket.data.user` and tenant permissions before allowing room joins.

