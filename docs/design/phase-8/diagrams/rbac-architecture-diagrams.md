# WORKZEN — Phase 8: RBAC Architecture Diagrams & System Specifications

---

## 1. System Diagrams Overview

The following 7 architecture diagrams illustrate the complete authorization model and security guarantees of WORKZEN Phase 8:

| Diagram | Filename | Key Security / Architectural Guarantee |
|---|---|---|
| **1. Multi-Tenant Hierarchy** | `rbac-diag-01-tenant-hierarchy.png` | Strict separation of Organization-level and Workspace-level authority boundaries. |
| **2. Permission Domains** | `rbac-diag-02-permission-categories.png` | 35 granular action grants mapped across 6 operational domains. |
| **3. Delegation Boundary** | `rbac-diag-03-delegation-boundary.png` | Prevents privilege escalation; callers cannot grant permissions they do not possess. |
| **4. Role Assignment Flow** | `rbac-diag-04-role-assignment-flow.png` | Verifies tenant membership, actor authority, and safely mutates `RoleAssignment`. |
| **5. Middleware Decision Engine** | `rbac-diag-05-middleware-decision-flow.png` | Fail-secure `requirePermission()` evaluation flow on every protected API endpoint. |
| **6. Audit Trail Pipeline** | `rbac-diag-06-audit-trail-pipeline.png` | Tamper-proof recording of role lifecycle, assignments, and 403 authorization blocks. |
| **7. Cache Invalidation Flow** | `rbac-diag-07-cache-invalidation-flow.png` | Zero-stale client state synchronized via TanStack Query and Zustand. |

---

## 2. Mermaid Workflow Blueprint

```mermaid
sequenceDiagram
    autonumber
    actor User as Corporate User
    participant Frontend as WORKZEN UI (React + Query)
    participant AuthMW as authMiddleware
    participant TenantMW as requireOrgMember
    participant RBACMW as requirePermission("org:manage_roles")
    participant RBACService as rbacService
    participant DB as MongoDB (Role / RoleAssignment)
    participant Audit as AuditLog Pipeline

    User->>Frontend: Perform Action (e.g. Create Custom Role)
    Frontend->>AuthMW: HTTP POST /api/v1/organizations/:id/roles (Bearer JWT)
    AuthMW->>TenantMW: verifyAccessToken() OK
    TenantMW->>RBACMW: requireOrgMember() verified active tenant
    RBACMW->>RBACService: hasPermission(userId, orgId, "org:manage_roles")
    RBACService->>DB: Query Direct RoleAssignments & Primary Membership Role
    DB-->>RBACService: Return Effective Permissions
    alt Permission Missing
        RBACMW->>Audit: Record ACCESS_DENIED security event
        RBACMW-->>Frontend: 403 FORBIDDEN_PERMISSION_DENIED
        Frontend-->>User: Display Permission-Denied State (403)
    else Permission Granted
        RBACMW->>RBACService: createRole(payload, actorId)
        RBACService->>DB: Insert Role document
        RBACService->>Audit: Record ROLE_CREATED event
        RBACMW-->>Frontend: 201 Created (Envelope)
        Frontend->>Frontend: queryClient.invalidateQueries(["roles"])
        Frontend-->>User: Display updated role matrix
    end
```

