# WORKZEN — PHASE 14: TASK MANAGEMENT ARCHITECTURE & WORKFLOWS

---

### 1. Data Model & Entity Relationship Diagram

```mermaid
erDiagram
    ORGANISATION ||--o{ WORKSPACE : contains
    WORKSPACE ||--o{ PROJECT : organizes
    PROJECT ||--o{ TASK : manages
    USER ||--o{ TASK : created_as_reporter
    USER ||--o{ TASK : assigned_as_member
    TASK ||--o{ AUDIT_LOG : tracks_activity

    TASK {
        ObjectId _id PK
        ObjectId organisationId FK
        ObjectId workspaceId FK
        ObjectId projectId FK
        Number taskNumber
        String title
        String description
        String status
        String priority
        Array assigneeIds
        ObjectId reporterId
        Date startDate
        Date dueDate
        Number estimatedHours
        Number loggedHours
        Array tags
        Number order
        Boolean isArchived
        Date archivedAt
        ObjectId archivedBy
        Date createdAt
        Date updatedAt
    }
```

---

### 2. Task Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Backlog : Task Created
    [*] --> ToDo : Task Scheduled for Sprint
    Backlog --> ToDo : Sprint Planning
    ToDo --> InProgress : Developer Starts Task
    InProgress --> Review : PR / Review Submitted
    Review --> InProgress : Changes Requested
    Review --> Done : Acceptance Criteria Met
    Done --> Archived : Sprint Completed & Archived
    Archived --> ToDo : Restored from Archive
    Archived --> [*] : Permanently Deleted (RBAC Guarded)
```

---

### 3. Real-Time Bi-Directional Synchronization Workflow

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Engineer (Task Management Page)
    actor UserB as Product Lead (Kanban Board Page)
    participant ClientA as Browser A (Workzen Client)
    participant Server as Express & Socket.IO Server
    participant DB as MongoDB Atlas
    participant ClientB as Browser B (Workzen Client)

    UserA->>ClientA: Updates Task Status to 'In Progress'
    ClientA->>Server: PATCH /api/v1/tasks/:id/status { status: 'in_progress' }
    Server->>DB: Updates Task record & Inserts AuditLog
    Server-->>ClientA: 200 OK (Updated Task Envelope)
    Server-)ClientB: Broadcast 'task:status_updated' to room 'project:PROJ_ID'
    ClientB->>ClientB: Moves card smoothly to 'In Progress' column
    ClientB->>UserB: Displays updated Kanban board with recalculated progress
```

