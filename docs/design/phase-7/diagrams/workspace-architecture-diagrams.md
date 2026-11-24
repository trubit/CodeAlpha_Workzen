# WORKZEN — Phase 7: Workspace Management Architecture Diagrams

---

## 1. System Architecture Topology

```mermaid
flowchart TD
    Client["React 18 SPA (Port 3070)<br/>WorkspaceSelector & Context"]
    Gateway["Express Gateway (Port 5050)<br/>JWT Auth & Tenant Middleware"]
    WSService["Workspace Service Layer<br/>(orgService / workspaceService)"]
    DB[(MongoDB Collections<br/>Workspaces, Organisations)]

    Client -->|HTTP / WS Token Handshake| Gateway
    Gateway -->|requireWorkspaceAccess| WSService
    WSService -->|Compound Index Query| DB
```

---

## 2. Organization-to-Workspace Tenancy Boundary

```mermaid
erDiagram
    ORGANISATION ||--o{ WORKSPACE : "owns"
    ORGANISATION ||--o{ ORGANISATION_MEMBERSHIP : "employs"
    USER ||--o{ ORGANISATION_MEMBERSHIP : "participates"
    WORKSPACE ||--o{ PROJECT : "contains"

    ORGANISATION {
        ObjectId _id PK
        string name
        string slug UK
        ObjectId ownerId FK
        string status
    }

    WORKSPACE {
        ObjectId _id PK
        ObjectId organisationId FK
        string name
        string slug
        string type
        string themeColor
        boolean isPrivate
        string status
        ObjectId createdBy FK
    }

    ORGANISATION_MEMBERSHIP {
        ObjectId _id PK
        ObjectId organisationId FK
        ObjectId userId FK
        string role
        string status
    }
```

---

## 3. Workspace Creation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant Frontend as React Workspace Modal
    participant API as Express Router
    participant Guard as requireOrgMember
    participant Service as workspaceService
    participant DB as MongoDB WorkspaceModel

    User->>Frontend: Fill Name, Type, Theme, Visibility
    Frontend->>Frontend: Validate with Zod createWorkspaceSchema
    Frontend->>API: POST /api/v1/organizations/:orgId/workspaces
    API->>Guard: Verify JWT & Active Org Membership
    Guard->>Service: Forward verified context
    Service->>Service: Generate collision-free slug within org
    Service->>DB: Check { organisationId, slug } index
    Service->>DB: Insert Workspace Document (status: 'active')
    DB-->>Service: Return saved document
    Service-->>API: Format standard envelope
    API-->>Frontend: 201 Created Response
    Frontend-->>User: Auto-select workspace & transition view
```

---

## 4. Workspace Selection & Context Switching

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Switcher as WorkspaceSelector Popover
    participant Store as Zustand Store
    participant Query as TanStack Query Cache
    participant API as /api/v1/workspaces/:id/select

    User->>Switcher: Click destination workspace
    Switcher->>API: POST /api/v1/workspaces/:id/select
    API->>API: Verify user membership in parent org
    API-->>Switcher: 200 OK Context Confirmed
    Switcher->>Store: setCurrentWorkspace(workspace)
    Switcher->>Query: invalidateQueries(['workspace', id])
    Switcher->>Store: resetStaleWorkspaceState()
    Store-->>User: Seamless UI transition without page reload
```

---

## 5. Multi-Tenant Authorization & Anti-IDOR Defense

```mermaid
flowchart TD
    Req["Inbound Request: /api/v1/workspaces/:workspaceId/*"] --> AuthCheck{"Authenticated via JWT?"}
    AuthCheck -- No --> R401["401 Unauthorized"]
    AuthCheck -- Yes --> ResolveWS["Query WorkspaceModel by workspaceId"]
    ResolveWS --> WSExists{"Workspace Exists?"}
    WSExists -- No --> R404["404 Not Found"]
    WSExists -- Yes --> CheckStatus{"Status === 'active'?"}
    CheckStatus -- No --> RArchived["403 Forbidden (Archived Workspace)"]
    CheckStatus -- Yes --> OrgCheck{"User has active membership in Workspace.organisationId?"}
    OrgCheck -- No --> RIDOR["403 Forbidden (IDOR Violation Rejected)"]
    OrgCheck -- Yes --> PassContext["Inject req.workspace & req.tenant into controller"]
    PassContext --> Exec["Execute Workspace Business Logic"]
```

