# WORKZEN — Phase 6 Architecture & Technical Diagrams
## Organization Management & Multi-Tenant Isolation

> **Product:** WORKZEN  
> **Tagline:** "Plan Smarter. Work Together. Achieve More."  
> **Phase:** 6 — Complete Organization Management System

---

## 1. Organization Management Architecture

```mermaid
graph TD
    Client["React Frontend (MUI, Zustand, TanStack Query)"] -->|"HTTPS / API (/api/v1/organizations/*)"| Express["Express API Router"]
    
    subgraph "Backend Security Layer"
        Express --> AuthMw["Authentication Middleware (JWT Bearer)"]
        AuthMw --> TenantMw["Tenant Authorization Middleware (requireOrgMember / requireOrgOwner)"]
    end
    
    subgraph "Service Layer"
        TenantMw --> OrgService["OrganisationService (CRUD, Slug, Ownership, Archival)"]
    end
    
    subgraph "Persistence Layer (MongoDB)"
        OrgService --> OrgModel["OrganisationModel (Tenant Schema)"]
        OrgService --> MemModel["OrganisationMembershipModel (User-Org Mapping)"]
        OrgService --> AuditModel["AuditLogModel (Ownership & Archival Audits)"]
    end
```

---

## 2. Organization Creation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant Client as Workzen Frontend
    participant API as Express API (/api/v1/organizations)
    participant Service as OrganisationService
    participant DB as MongoDB (Organisation & Membership)

    User->>Client: Fills Org Name, Industry, Size & Timezone
    Client->>Client: Zod Validation (createOrgSchema)
    Client->>API: POST /api/v1/organizations (Bearer JWT)
    API->>API: Verify User Token
    API->>Service: createOrganisation(userId, data)
    Service->>Service: Normalize & generate unique slug (e.g., 'acme-corp-1')
    Service->>DB: Save new Organisation (ownerId = userId)
    Service->>DB: Create initial Membership (userId, orgId, role = 'owner')
    Service->>DB: Log Audit Action ('ORGANISATION_CREATED')
    Service-->>API: Return new Organisation & Active Membership
    API-->>Client: 201 Created Envelope
    Client->>Client: Update Zustand Store & Set Active Org
    Client-->>User: Navigate to Org Dashboard
```

---

## 3. Organization Membership Relationship

```mermaid
erDiagram
    USER ||--o{ ORGANISATION_MEMBERSHIP : holds
    ORGANISATION ||--|{ ORGANISATION_MEMBERSHIP : has
    ORGANISATION ||--|| USER : "owned by"
    
    USER {
        ObjectId _id PK
        string email
        string firstName
        string lastName
        string status
    }

    ORGANISATION {
        ObjectId _id PK
        string name
        string slug UK
        ObjectId ownerId FK
        string industry
        string organizationSize
        string status
        Date createdAt
    }

    ORGANISATION_MEMBERSHIP {
        ObjectId _id PK
        ObjectId organisationId FK
        ObjectId userId FK
        string role "owner | admin | member"
        string status "active | invited | suspended"
        Date joinedAt
    }
```

---

## 4. Multi-Tenant Request Authorization Flow (IDOR Prevention)

```mermaid
flowchart TD
    Req["Incoming API Request: /api/v1/organizations/:orgId/*"] --> AuthCheck{"Is JWT Token Valid?"}
    AuthCheck -- No --> Ret401["Return 401 Unauthorized"]
    AuthCheck -- Yes --> ParseOrg["Extract Target Org ID from Route / Header"]
    
    ParseOrg --> MemCheck{"Query Membership in DB:\nuserId == req.user.id &&\norgId == targetOrgId &&\nstatus == 'active'"}
    
    MemCheck -- Not Found --> BlockIDOR["Block Access! Return 403 Forbidden (Cross-Tenant Access Prohibited)"]
    MemCheck -- Active Member --> ActionCheck{"Is Route Restricted to Owner?\n(Settings, Branding, Deletion, Transfer)"}
    
    ActionCheck -- No (Read/Member Action) --> Allow["Set req.tenant & Execute Service Handler"]
    ActionCheck -- Yes --> OwnerCheck{"Does req.user.id == org.ownerId?"}
    
    OwnerCheck -- No --> BlockOwner["Return 403 Forbidden (Owner Authorization Required)"]
    OwnerCheck -- Yes --> Allow
```

---

## 5. Organization Selection Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant Switcher as Org Selector UI
    participant Store as Zustand Store (useWorkzenStore)
    participant Query as TanStack Query Cache
    participant API as Backend API

    User->>Switcher: Opens Organization Dropdown
    Switcher->>Store: Get available organizations from current session
    User->>Switcher: Clicks on target organization
    Switcher->>API: POST /api/v1/organizations/:id/select
    API->>API: Validate User Membership
    API-->>Switcher: 200 OK (Confirmed Selection)
    Switcher->>Query: Invalidate all queries for previous org
    Switcher->>Store: setCurrentOrg(selectedOrg)
    Store-->>User: Active context updated, data refreshed
```

---

## 6. Organization Ownership Transfer & Deletion Workflow

```mermaid
flowchart TD
    StartDestructive["Admin initiates Lifecycle Action"] --> Choice{"Action Type"}
    
    %% Ownership Transfer
    Choice -- "Transfer Ownership" --> PromptRecipient["Select new Owner from active members & type 'TRANSFER'"]
    PromptRecipient --> ValidateRecip{"Is recipient active member?"}
    ValidateRecip -- No --> ErrRecip["Return 400 Invalid Recipient"]
    ValidateRecip -- Yes --> UpdateOwner["Set org.ownerId = recipientId\nUpdate membership role to 'owner'\nLog in AuditLog"]
    UpdateOwner --> SuccessTransfer["Ownership Transferred"]

    %% Organization Deletion / Archival
    Choice -- "Archive / Delete Org" --> PromptName["Require typing exact Organization Name"]
    PromptName --> MatchCheck{"Does typed string match org.name exactly?"}
    MatchCheck -- No --> RejectDel["Reject Confirmation"]
    MatchCheck -- Yes --> CheckOwner{"Is caller the authenticated Owner?"}
    CheckOwner -- No --> DenyDel["403 Forbidden"]
    CheckOwner -- Yes --> SoftDelete["Update org status = 'archived'\nSet archivedAt = now()\nRevoke active tenant sessions\nLog in AuditLog"]
    SoftDelete --> EndDel["Tenant safely archived; invisible to active queries"]
```

---

## 7. Organization Database Relationship Diagram

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +string email
        +string firstName
        +string lastName
        +string status
        +boolean isEmailVerified
    }

    class Organisation {
        +ObjectId _id
        +string name
        +string slug
        +string description
        +string industry
        +string organizationSize
        +string logoUrl
        +string website
        +string country
        +string timezone
        +ObjectId ownerId
        +string status
        +Date archivedAt
        +Object settings
        +string plan
        +number seats
    }

    class OrganisationMembership {
        +ObjectId _id
        +ObjectId organisationId
        +ObjectId userId
        +string role
        +string status
        +Date joinedAt
    }

    class AuditLog {
        +ObjectId _id
        +ObjectId organisationId
        +ObjectId userId
        +string action
        +string entityType
        +ObjectId entityId
        +Object metadata
        +Date createdAt
    }

    User "1" -- "0..*" OrganisationMembership : participates
    Organisation "1" -- "1..*" OrganisationMembership : contains
    User "1" -- "0..*" Organisation : owns
    Organisation "1" -- "0..*" AuditLog : audits
```

