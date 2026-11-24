# WORKZEN — Database & Multi-Tenant SaaS Architecture

**Product:** WORKZEN  
**Database Engine:** MongoDB (via Mongoose ODM)  
**Tenancy Model:** Logical Multi-Tenant Segregation via Tenant Partition Keys  

---

## 1. Multi-Tenant Architecture & Isolation Enforcement

Workzen enforces strict multi-tenancy to ensure that multiple independent organisations securely coexist in the same database instance without risk of cross-tenant data leakage.

### Isolation Layers

1. **Authentication & Identity Layer:**
   - JWT tokens encode `userId` and the user's active `organisationId`.
   - Any API request targeted at a tenant-scoped resource requires an `X-Organisation-Id` header (or resolved active tenant from the user context).

2. **Middleware Guard Layer (`tenantIsolationMiddleware`):**
   - Extracts the requested `organisationId`.
   - Validates against `OrganisationMembership` that the authenticated user is an active member with appropriate roles.
   - Attaches `req.tenant = { organisationId, role, permissions }` to the Express request object.
   - Requests attempting to access an organization where the user lacks membership fail immediately with `403 Forbidden`.

3. **Service & Query Layer:**
   - **Mandatory Filter Injection:** Every Mongoose query on tenant-scoped collections MUST include `{ organisationId: req.tenant.organisationId }`.
   - Changing IDs in the URL (e.g. `GET /api/v1/tasks/:id`) CANNOT return records belonging to another tenant because the query enforces:
     ```typescript
     Task.findOne({ _id: taskId, organisationId: req.tenant.organisationId });
     ```
   - In mutations (`update`, `delete`), queries explicitly match both `_id` and `organisationId`.

4. **Compound Indexing Layer:**
   - All tenant-scoped collections have a leading `organisationId` index. This guarantees extreme query isolation and performance.

---

## 2. Complete Entity Catalog (All 23 Core Collections)

### 1. Users (`users`)
- **Purpose:** Global user identity credentials, security profile, and preferences.
- **Key Fields:**
  - `_id`: ObjectId
  - `email`: String (lowercase, unique, indexed)
  - `passwordHash`: String (bcrypt hash)
  - `firstName`, `lastName`: String
  - `avatarUrl`: String
  - `isEmailVerified`: Boolean (default: false)
  - `emailVerificationToken`: String (hashed)
  - `emailVerificationExpires`: Date
  - `passwordResetOTP`: String (hashed)
  - `passwordResetExpires`: Date
  - `twoFactorEnabled`: Boolean (default: false)
  - `twoFactorSecret`: String
  - `status`: Enum (`'active' | 'suspended' | 'pending'`)
  - `lastLoginAt`: Date
  - `createdAt`, `updatedAt`: Timestamps
- **Indexes:** `{ email: 1 }` (unique).

### 2. Organisations (`organisations`)
- **Purpose:** Top-level tenant account representing a company, enterprise, or agency.
- **Key Fields:**
  - `_id`: ObjectId
  - `name`: String (required, trimmed)
  - `slug`: String (unique, URL-friendly)
  - `logoUrl`: String
  - `domain`: String (optional, for corporate email auto-join)
  - `ownerId`: ObjectId (ref: `User`)
  - `plan`: Enum (`'starter' | 'professional' | 'enterprise'`)
  - `subscriptionId`: ObjectId (ref: `Subscription`)
  - `billingEmail`: String
  - `settings`: Object (allowed domains, SSO config, default member roles)
  - `createdAt`, `updatedAt`: Timestamps
- **Indexes:** `{ slug: 1 }` (unique), `{ ownerId: 1 }`.

### 3. Organisation Memberships (`organisation_memberships`)
- **Purpose:** Associates Users with Organisations and assigns organization-wide roles.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`, indexed)
  - `userId`: ObjectId (ref: `User`, indexed)
  - `role`: Enum (`'owner' | 'admin' | 'manager' | 'member' | 'guest'`)
  - `status`: Enum (`'active' | 'invited' | 'suspended'`)
  - `joinedAt`: Date
- **Indexes:** `{ organisationId: 1, userId: 1 }` (unique compound index).

### 4. Workspaces (`workspaces`)
- **Purpose:** Logical divisions within an Organisation (e.g. Engineering, Marketing, Product).
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`, required)
  - `name`: String
  - `slug`: String
  - `description`: String
  - `departmentId`: ObjectId (ref: `Department`)
  - `isPrivate`: Boolean (default: false)
  - `createdBy`: ObjectId (ref: `User`)
  - `createdAt`, `updatedAt`: Timestamps
- **Indexes:** `{ organisationId: 1, slug: 1 }` (unique compound).

### 5. Workspace Memberships (`workspace_memberships`)
- **Purpose:** Granular access control mapping users to specific workspaces.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `workspaceId`: ObjectId (ref: `Workspace`)
  - `userId`: ObjectId (ref: `User`)
  - `role`: Enum (`'admin' | 'member' | 'viewer'`)
- **Indexes:** `{ workspaceId: 1, userId: 1 }` (unique compound), `{ organisationId: 1 }`.

### 6. Departments (`departments`)
- **Purpose:** High-level organizational departments (e.g., Finance, Human Resources, Tech).
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `name`: String
  - `leadUserId`: ObjectId (ref: `User`)
- **Indexes:** `{ organisationId: 1, name: 1 }`.

### 7. Teams (`teams`)
- **Purpose:** Sub-units within departments or workspaces for collaborative grouping.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `workspaceId`: ObjectId (ref: `Workspace`)
  - `name`: String
  - `leaderId`: ObjectId (ref: `User`)
  - `memberIds`: Array of ObjectIds (ref: `User`)
- **Indexes:** `{ organisationId: 1, workspaceId: 1 }`.

### 8. Projects (`projects`)
- **Purpose:** Core container for tasks, workflows, milestones, and deliverables.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `workspaceId`: ObjectId (ref: `Workspace`)
  - `name`: String
  - `key`: String (e.g., "ENG", "MKT", 2-5 capital letters)
  - `description`: String
  - `status`: Enum (`'planning' | 'active' | 'on_hold' | 'completed' | 'archived'`)
  - `priority`: Enum (`'low' | 'medium' | 'high' | 'urgent'`)
  - `color`: String (HEX code)
  - `startDate`, `targetDate`: Date
  - `leadId`: ObjectId (ref: `User`)
  - `budget`: Number
  - `createdAt`, `updatedAt`: Timestamps
- **Indexes:** `{ organisationId: 1, workspaceId: 1 }`, `{ organisationId: 1, key: 1 }` (unique).

### 9. Project Members (`project_members`)
- **Purpose:** Explicit assignment of members and guests to individual projects.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `projectId`: ObjectId (ref: `Project`)
  - `userId`: ObjectId (ref: `User`)
  - `role`: Enum (`'lead' | 'contributor' | 'observer'`)
- **Indexes:** `{ projectId: 1, userId: 1 }` (unique compound).

### 10. Tasks (`tasks`)
- **Purpose:** Fundamental unit of work with status, priority, and assignments.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`, required)
  - `workspaceId`: ObjectId (ref: `Workspace`, required)
  - `projectId`: ObjectId (ref: `Project`, required)
  - `taskNumber`: Number (sequential per project, e.g., ENG-104)
  - `title`: String (required, max 255 chars)
  - `description`: String (rich text / markdown)
  - `status`: Enum (`'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'`)
  - `priority`: Enum (`'low' | 'medium' | 'high' | 'urgent'`)
  - `assigneeIds`: Array of ObjectIds (ref: `User`)
  - `reporterId`: ObjectId (ref: `User`)
  - `dueDate`: Date
  - `estimatedHours`, `loggedHours`: Number
  - `tags`: Array of Strings
  - `order`: Number (for Kanban column positioning)
  - `createdAt`, `updatedAt`: Timestamps
- **Indexes:** 
  - `{ organisationId: 1, projectId: 1, status: 1 }`
  - `{ organisationId: 1, assigneeIds: 1 }`
  - `{ projectId: 1, taskNumber: 1 }` (unique compound).

### 11. Subtasks (`subtasks`)
- **Purpose:** Child checklist items nested under a parent task.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `taskId`: ObjectId (ref: `Task`)
  - `title`: String
  - `isCompleted`: Boolean (default: false)
  - `assigneeId`: ObjectId (ref: `User`)
  - `dueDate`: Date
- **Indexes:** `{ taskId: 1, isCompleted: 1 }`, `{ organisationId: 1 }`.

### 12. Task Dependencies (`task_dependencies`)
- **Purpose:** Gantt and timeline relationship links (blocking/blocked-by).
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `taskId`: ObjectId (ref: `Task`, blocked task)
  - `dependsOnTaskId`: ObjectId (ref: `Task`, blocking task)
  - `type`: Enum (`'blocks' | 'blocked_by' | 'relates_to'`)
- **Indexes:** `{ taskId: 1, dependsOnTaskId: 1 }` (unique compound).

### 13. Comments (`comments`)
- **Purpose:** Threaded discussions and notes on tasks.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `taskId`: ObjectId (ref: `Task`)
  - `authorId`: ObjectId (ref: `User`)
  - `content`: String (markdown supported)
  - `parentCommentId`: ObjectId (ref: `Comment`, for threaded replies)
  - `mentions`: Array of ObjectIds (ref: `User`)
  - `createdAt`, `updatedAt`: Timestamps
- **Indexes:** `{ taskId: 1, createdAt: -1 }`.

### 14. Attachments (`attachments`)
- **Purpose:** Files, documents, and images uploaded to Cloudinary.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `taskId`: ObjectId (ref: `Task`, optional)
  - `projectId`: ObjectId (ref: `Project`, optional)
  - `uploadedBy`: ObjectId (ref: `User`)
  - `fileName`: String
  - `fileSize`: Number (in bytes)
  - `mimeType`: String
  - `cloudinaryUrl`: String
  - `cloudinaryPublicId`: String
- **Indexes:** `{ organisationId: 1, taskId: 1 }`.

### 15. Notifications (`notifications`)
- **Purpose:** Real-time push and in-app alert inbox for users.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `userId`: ObjectId (ref: `User`, recipient)
  - `actorId`: ObjectId (ref: `User`, triggerer)
  - `type`: Enum (`'task_assigned' | 'mention' | 'status_change' | 'comment' | 'deadline'`)
  - `title`: String
  - `message`: String
  - `entityType`: Enum (`'task' | 'project' | 'organisation'`)
  - `entityId`: ObjectId
  - `isRead`: Boolean (default: false)
  - `createdAt`: Date
- **Indexes:** `{ userId: 1, isRead: 1, createdAt: -1 }`.

### 16. Conversations (`conversations`)
- **Purpose:** Channels and direct message rooms for team collaboration.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `type`: Enum (`'direct' | 'group' | 'channel'`)
  - `channelName`: String (optional)
  - `participantIds`: Array of ObjectIds (ref: `User`)
  - `lastMessageAt`: Date
- **Indexes:** `{ organisationId: 1, participantIds: 1 }`.

### 17. Messages (`messages`)
- **Purpose:** Real-time chat messages dispatched via Socket.IO.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `conversationId`: ObjectId (ref: `Conversation`)
  - `senderId`: ObjectId (ref: `User`)
  - `content`: String
  - `attachments`: Array of ObjectIds (ref: `Attachment`)
  - `readBy`: Array of ObjectIds (ref: `User`)
  - `createdAt`: Date
- **Indexes:** `{ conversationId: 1, createdAt: -1 }`.

### 18. Time Entries (`time_entries`)
- **Purpose:** Work time tracking for productivity metrics, billing, and reporting.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `taskId`: ObjectId (ref: `Task`)
  - `userId`: ObjectId (ref: `User`)
  - `durationMinutes`: Number
  - `description`: String
  - `startedAt`, `endedAt`: Date
- **Indexes:** `{ organisationId: 1, userId: 1, startedAt: -1 }`.

### 19. Automations (`automations`)
- **Purpose:** Event-driven workflow rules (e.g., "When task moved to Done, assign Reviewer").
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `projectId`: ObjectId (ref: `Project`)
  - `name`: String
  - `trigger`: Object (`{ event: string, conditions: any }`)
  - `actions`: Array of Objects (`{ actionType: string, payload: any }`)
  - `isActive`: Boolean (default: true)
- **Indexes:** `{ projectId: 1, isActive: 1 }`.

### 20. Audit Logs (`audit_logs`)
- **Purpose:** Immutable compliance trail of sensitive changes and access events.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `userId`: ObjectId (ref: `User`)
  - `action`: String (e.g., `'USER_INVITED'`, `'PROJECT_DELETED'`, `'BILLING_UPDATED'`)
  - `entityType`: String
  - `entityId`: ObjectId
  - `ipAddress`: String
  - `userAgent`: String
  - `changes`: Object (`{ before: any, after: any }`)
  - `createdAt`: Date
- **Indexes:** `{ organisationId: 1, createdAt: -1 }`.

### 21. Invitations (`invitations`)
- **Purpose:** Pending membership invites for external team members and guests.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `email`: String (lowercase)
  - `role`: Enum (`'admin' | 'manager' | 'member' | 'guest'`)
  - `workspaceIds`: Array of ObjectIds (ref: `Workspace`)
  - `invitedBy`: ObjectId (ref: `User`)
  - `token`: String (cryptographically secure token)
  - `expiresAt`: Date (e.g. 7 days)
  - `status`: Enum (`'pending' | 'accepted' | 'expired' | 'revoked'`)
- **Indexes:** `{ token: 1 }` (unique), `{ organisationId: 1, email: 1 }`.

### 22. Subscriptions (`subscriptions`)
- **Purpose:** SaaS billing tier management, seat quotas, and payment statuses.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`, unique)
  - `gateway`: Enum (`'stripe' | 'paystack'`)
  - `subscriptionId`: String (external customer ID)
  - `plan`: Enum (`'free' | 'starter' | 'professional' | 'enterprise'`)
  - `seats`: Number (licensed active user limit)
  - `currentPeriodStart`, `currentPeriodEnd`: Date
  - `status`: Enum (`'active' | 'past_due' | 'canceled' | 'trialing'`)
- **Indexes:** `{ organisationId: 1 }` (unique), `{ subscriptionId: 1 }`.

### 23. Payments (`payments`)
- **Purpose:** Historical transactional payment records for invoice auditing.
- **Key Fields:**
  - `_id`: ObjectId
  - `organisationId`: ObjectId (ref: `Organisation`)
  - `gateway`: Enum (`'stripe' | 'paystack'`)
  - `transactionId`: String (unique)
  - `amount`: Number (in cents or minor units)
  - `currency`: String (e.g., `'USD'`, `'NGN'`, `'EUR'`)
  - `status`: Enum (`'succeeded' | 'failed' | 'pending' | 'refunded'`)
  - `invoiceUrl`: String
  - `paidAt`: Date
- **Indexes:** `{ organisationId: 1, paidAt: -1 }`, `{ transactionId: 1 }` (unique).

