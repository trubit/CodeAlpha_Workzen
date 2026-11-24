# WORKZEN — Architecture Diagrams Catalog

**Product:** WORKZEN  
**Category:** Enterprise Project Management & Team Collaboration SaaS  
**Format:** GitHub Flavored Markdown / Mermaid Diagrams  

---

## Diagram 1: Complete System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer["Frontend Client Tier (React 18 + Vite + MUI + Zustand)"]
        Browser["Enterprise Web Browser"]
        PWA["Desktop / Responsive Web"]
    end

    subgraph GatewayLayer["Edge & Security Layer"]
        ReverseProxy["Reverse Proxy / Nginx / Cloudflare"]
        RateLimiter["Rate Limiting & DDoS Shield"]
        SecurityHeaders["Helmet & Strict CORS"]
    end

    subgraph BackendLayer["Backend Application Tier (Node.js + Express + TypeScript)"]
        APIRouter["API Router (/api/v1)"]
        AuthMiddleware["JWT & Tenant Guard Middleware"]
        Controllers["Domain Controllers"]
        Services["Business Logic Services"]
        SocketServer["Socket.IO Real-Time Gateway"]
    end

    subgraph StorageLayer["Data & Persistence Tier"]
        MongoDB[(MongoDB Cluster - Tenant Isolated)]
        Cloudinary[(Cloudinary File Storage)]
    end

    subgraph ExternalServices["Third-Party Integrations"]
        StripeGateway["Stripe Payments"]
        PaystackGateway["Paystack Payments"]
        SMTPServer["SMTP Mailtrap / SendGrid"]
    end

    Browser --> ReverseProxy
    PWA --> ReverseProxy
    ReverseProxy --> RateLimiter --> SecurityHeaders --> APIRouter
    ReverseProxy <--> SocketServer

    APIRouter --> AuthMiddleware --> Controllers --> Services
    SocketServer <--> Services

    Services --> MongoDB
    Services --> Cloudinary
    Services --> StripeGateway
    Services --> PaystackGateway
    Services --> SMTPServer
```

---

## Diagram 2: Unified Repository Architecture

```mermaid
graph TD
    Root["workzen (Root Directory)"]
    
    Root --> RootConfigs["Root Manifests & Configs"]
    RootConfigs --> Pkg["package.json (Single Root)"]
    RootConfigs --> Lock["package-lock.json"]
    RootConfigs --> Env[".env / .env.example"]
    RootConfigs --> TSConfig["tsconfig.json / tsconfig.server.json"]
    RootConfigs --> ViteConf["vite.config.ts"]
    RootConfigs --> Docker["Dockerfile & docker-compose.yml"]
    RootConfigs --> CI[".github/workflows/ci.yml"]

    Root --> Docs["docs/"]
    Docs --> Assessment["01-project-assessment.md"]
    Docs --> SysArch["02-system-architecture.md"]
    Docs --> DBMTR["03-database-and-multitenancy.md"]
    Docs --> SecArch["04-auth-and-security.md"]
    Docs --> Diags["05-architecture-diagrams.md"]
    Docs --> CompRep["06-phase1-completion-report.md"]

    Root --> Src["src/"]
    Src --> Shared["src/shared/ (Single Source of Truth)"]
    Shared --> SharedTypes["types/ (DTOs & Entity Interfaces)"]
    Shared --> SharedConst["constants/ (Roles, Statuses, Enums)"]
    Shared --> SharedVal["validation/ (Zod Schemas)"]

    Src --> Client["src/client/ (React + MUI + Bootstrap + Zustand)"]
    Client --> ClientComp["components/ (Layout, Modals, Common)"]
    Client --> ClientPages["pages/ (13 Enterprise Prototype Views)"]
    Client --> ClientStore["store/ (Zustand Global State)"]
    Client --> ClientTheme["theme/ (MUI & Bootstrap Integration)"]

    Src --> Server["src/server/ (Node.js + Express + TypeScript)"]
    Server --> ServConfig["config/ (DB, Cloudinary, Keys)"]
    Server --> ServCtrl["controllers/ (HTTP Handlers)"]
    Server --> ServMid["middleware/ (Auth, Tenant, RBAC, Limiter)"]
    Server --> ServModels["models/ (23 Mongoose Schemas)"]
    Server --> ServRoutes["routes/ (/api/v1 Endpoints)"]
    Server --> ServServices["services/ (Domain Business Logic)"]
    Server --> ServSocket["socket/ (Real-Time Gateways)"]
```

---

## Diagram 3: Frontend Component Architecture

```mermaid
flowchart TD
    App["App.tsx (Root Provider & Router)"]
    
    subgraph Providers["Global Context Providers"]
        MuiTheme["MUI ThemeProvider"]
        QueryClient["TanStack QueryClientProvider"]
        Zustand["Zustand Store Context"]
    end

    subgraph Shell["Enterprise Application Shell (AppLayout)"]
        Sidebar["Sidebar Navigation (Tenant Switcher, Links)"]
        TopHeader["Header Bar (Search, Actions, Notifications, Profile)"]
        Breadcrumbs["Dynamic Breadcrumbs Navigation"]
        MainOutlet["Main Viewport Content"]
    end

    subgraph PrototypePages["13 Enterprise Page Views"]
        P1["LandingPage"]
        P2["LoginPage"]
        P3["RegisterPage"]
        P4["EnterpriseDashboard"]
        P5["OrganisationDashboard"]
        P6["WorkspaceDashboard"]
        P7["ProjectOverview"]
        P8["KanbanBoard"]
        P9["TaskDetailsPage"]
        P10["TeamManagementPage"]
        P11["NotificationCentre"]
        P12["CalendarPage"]
        P13["SettingsPage"]
    end

    subgraph CommonUI["Reusable Enterprise UI Elements"]
        StatusBadge["StatusBadge Component"]
        PriorityChip["PriorityChip Component"]
        UserAvatar["UserAvatar & Group Component"]
        EmptyState["EmptyState Widget"]
        ConfirmModal["Confirmation / Form Dialogs"]
    end

    App --> Providers --> Shell
    Shell --> Sidebar
    Shell --> TopHeader
    Shell --> Breadcrumbs
    Shell --> MainOutlet

    MainOutlet --> PrototypePages
    PrototypePages --> CommonUI
```

---

## Diagram 4: Backend Service Architecture

```mermaid
flowchart LR
    subgraph ControllerTier["Controller Tier"]
        AuthCtrl["AuthController"]
        OrgCtrl["OrganisationController"]
        WorkCtrl["WorkspaceController"]
        ProjCtrl["ProjectController"]
        TaskCtrl["TaskController"]
        NotifCtrl["NotificationController"]
        BillCtrl["BillingController"]
    end

    subgraph ServiceTier["Service & Business Logic Tier"]
        AuthSvc["AuthService"]
        TenantSvc["TenantIsolationService"]
        OrgSvc["OrganisationService"]
        ProjSvc["ProjectService"]
        TaskSvc["TaskWorkflowService"]
        EventSvc["RealtimeEventService"]
        PaymentSvc["PaymentGatewayService"]
    end

    subgraph DataAccessTier["Mongoose Data Access Tier"]
        UserModel["UserModel"]
        OrgModel["OrganisationModel"]
        WorkspaceModel["WorkspaceModel"]
        ProjectModel["ProjectModel"]
        TaskModel["TaskModel"]
        AuditModel["AuditLogModel"]
    end

    AuthCtrl --> AuthSvc
    OrgCtrl --> OrgSvc
    WorkCtrl --> TenantSvc
    ProjCtrl --> ProjSvc
    TaskCtrl --> TaskSvc
    NotifCtrl --> EventSvc
    BillCtrl --> PaymentSvc

    AuthSvc --> UserModel
    OrgSvc --> OrgModel
    TenantSvc --> WorkspaceModel
    ProjSvc --> ProjectModel
    TaskSvc --> TaskModel
    TaskSvc --> EventSvc
    Services --> AuditModel
```

---

## Diagram 5: Multi-Tenant Organisation Architecture

```mermaid
graph TD
    Enterprise["Enterprise Tenant Cloud"]
    
    subgraph Org1["Organisation A (Acme Corp - ID: org_001)"]
        W1A["Workspace: Engineering"]
        W2A["Workspace: Marketing"]
        
        W1A --> P1A["Project: Mobile App"]
        W1A --> P2A["Project: Backend API"]
        W2A --> P3A["Project: Q4 Launch Campaign"]

        P1A --> T1A["Tasks (Scoped to org_001)"]
        P2A --> T2A["Tasks (Scoped to org_001)"]
    end

    subgraph Org2["Organisation B (Starlight Labs - ID: org_002)"]
        W1B["Workspace: Research"]
        W1B --> P1B["Project: Deep Learning"]
        P1B --> T1B["Tasks (Scoped to org_002)"]
    end

    subgraph IsolationGuards["Multi-Tenant Isolation Wall"]
        M1["Tenant Middleware verifies req.headers['x-organisation-id']"]
        M2["Service Layer forces query filter { organisationId: activeOrgId }"]
        M3["Compound Index { organisationId: 1, _id: 1 } prevents leakage"]
    end

    Enterprise --> Org1
    Enterprise --> Org2
    Org1 -.- IsolationGuards
    Org2 -.- IsolationGuards
```

---

## Diagram 6: Authentication & Authorization Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client User
    participant Frontend as Workzen Frontend (React)
    participant AuthAPI as Auth Controller & Middleware
    participant AuthService as AuthService
    participant DB as MongoDB (Users & Sessions)

    User->>Frontend: Enters Email & Password
    Frontend->>AuthAPI: POST /api/v1/auth/login
    AuthAPI->>AuthService: Validate Credentials
    AuthService->>DB: Find User by Email
    DB-->>AuthService: Return User Record
    AuthService->>AuthService: Compare Bcrypt Password Hash
    
    alt Credentials Invalid
        AuthService-->>AuthAPI: 401 Unauthorized
        AuthAPI-->>Frontend: Display Error Message
    else Credentials Valid
        AuthService->>AuthService: Generate Access Token (15m) & Refresh Token (7d)
        AuthService->>DB: Save Hashed Session Refresh Token
        AuthService-->>AuthAPI: Return Tokens & User Profile
        AuthAPI-->>Frontend: 200 OK (Set HttpOnly Cookie + JSON Access Token)
        Frontend->>Frontend: Store Access Token in Zustand Memory
        Frontend->>User: Route to Workspace Dashboard
    end
```

---

## Diagram 7: MongoDB Entity Relationship Diagram (Key Collections)

```mermaid
erDiagram
    USERS ||--o{ ORGANISATION_MEMBERSHIPS : holds
    ORGANISATIONS ||--o{ ORGANISATION_MEMBERSHIPS : contains
    ORGANISATIONS ||--o{ WORKSPACES : owns
    WORKSPACES ||--o{ WORKSPACE_MEMBERSHIPS : contains
    USERS ||--o{ WORKSPACE_MEMBERSHIPS : participates
    WORKSPACES ||--o{ PROJECTS : organizes
    PROJECTS ||--o{ TASKS : contains
    PROJECTS ||--o{ PROJECT_MEMBERS : assigns
    USERS ||--o{ PROJECT_MEMBERS : joins
    TASKS ||--o{ SUBTASKS : has
    TASKS ||--o{ COMMENTS : receives
    USERS ||--o{ COMMENTS : authors
    TASKS ||--o{ TIME_ENTRIES : logs
    USERS ||--o{ TIME_ENTRIES : records
    ORGANISATIONS ||--o{ SUBSCRIPTIONS : billed_under
    ORGANISATIONS ||--o{ AUDIT_LOGS : audits
    ORGANISATIONS ||--o{ INVITATIONS : sends

    USERS {
        ObjectId _id PK
        string email UK
        string passwordHash
        string firstName
        string lastName
        boolean isEmailVerified
        string role
        date createdAt
    }

    ORGANISATIONS {
        ObjectId _id PK
        string name
        string slug UK
        ObjectId ownerId FK
        string plan
        date createdAt
    }

    WORKSPACES {
        ObjectId _id PK
        ObjectId organisationId FK
        string name
        string slug
        boolean isPrivate
    }

    PROJECTS {
        ObjectId _id PK
        ObjectId organisationId FK
        ObjectId workspaceId FK
        string name
        string key
        string status
        date targetDate
    }

    TASKS {
        ObjectId _id PK
        ObjectId organisationId FK
        ObjectId workspaceId FK
        ObjectId projectId FK
        number taskNumber
        string title
        string status
        string priority
        ObjectId reporterId FK
        array assigneeIds
        date dueDate
    }
```

---

## Diagram 8: Frontend-to-Backend Communication

```mermaid
flowchart TD
    subgraph Client["React Client UI"]
        Component["UI Component (e.g. KanbanBoard)"]
        ReactQuery["TanStack Query (useQuery / useMutation)"]
        ApiClient["Axios / Fetch API Client"]
    end

    subgraph Network["Network Boundary"]
        AuthHeader["Authorization: Bearer <AccessToken>"]
        TenantHeader["X-Organisation-Id: <OrgId>"]
    end

    subgraph Server["Express Backend"]
        CorsHelmet["CORS, Helmet & Request Parser"]
        AuthGuard["JWT Verification Guard"]
        TenantGuard["Tenant Membership & RBAC Guard"]
        RouteHandler["Controller & Service Handler"]
        Mongo["MongoDB Atomic Execution"]
    end

    Component -->|Invokes mutation| ReactQuery
    ReactQuery --> ApiClient
    ApiClient -->|Sends HTTP Request with headers| AuthHeader & TenantHeader
    AuthHeader & TenantHeader --> CorsHelmet
    CorsHelmet --> AuthGuard
    AuthGuard --> TenantGuard
    TenantGuard --> RouteHandler
    RouteHandler --> Mongo
    Mongo -->|Result document| RouteHandler
    RouteHandler -->|ResponseEnvelope JSON| ApiClient
    ApiClient -->|Updates cache| ReactQuery
    ReactQuery -->|Re-renders view| Component
```

---

## Diagram 9: Real-Time Socket.IO Communication

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Member Alice (UI)
    participant SocketClientA as Alice's Socket.IO Client
    participant SocketGateway as Workzen Socket Server
    participant DB as MongoDB
    participant SocketClientB as Bob's Socket.IO Client
    actor Bob as Member Bob (UI)

    SocketClientA->>SocketGateway: Connect Handshake { token: JWT }
    SocketGateway->>SocketGateway: Authenticate & Identify User Alice
    SocketGateway->>SocketGateway: Join Rooms [org:001, project:ENG_1]
    
    SocketClientB->>SocketGateway: Connect Handshake { token: JWT }
    SocketGateway->>SocketGateway: Authenticate & Join Rooms [org:001, project:ENG_1]

    Alice->>SocketClientA: Drags Task "ENG-104" to "Done"
    SocketClientA->>SocketGateway: emit("task:update_status", { taskId: "ENG-104", status: "done" })
    
    SocketGateway->>DB: Update Task status in DB (Tenant Isolated)
    DB-->>SocketGateway: Update Acknowledged
    
    SocketGateway->>SocketGateway: Broadcast to room "project:ENG_1"
    SocketGateway-->>SocketClientA: emit("task:updated", payload) [Optimistic Ack]
    SocketGateway-->>SocketClientB: emit("task:updated", payload) [Real-Time Push]
    
    SocketClientB->>Bob: Smoothly moves card to "Done" column in real-time!
```

