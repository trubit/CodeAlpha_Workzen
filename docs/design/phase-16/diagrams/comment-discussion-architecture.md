# WORKZEN — PHASE 16: COMMENT & DISCUSSION ARCHITECTURE

## 1. Domain Architecture & Entity Relationships

```mermaid
erDiagram
    ORGANISATION ||--o{ TASK : scopes
    WORKSPACE ||--o{ TASK : contains
    PROJECT ||--o{ TASK : owns
    USER ||--o{ COMMENT : authors
    TASK ||--o{ COMMENT : attaches
    COMMENT ||--o{ COMMENT : replies_to
    COMMENT ||--o{ NOTIFICATION : triggers
    TASK ||--o{ AUDIT_LOG : tracks

    COMMENT {
        ObjectId _id PK
        ObjectId taskId FK
        ObjectId projectId FK
        ObjectId workspaceId FK
        ObjectId organisationId FK
        ObjectId authorId FK
        String content
        ObjectId parentId FK "Null for root, populated for 1-level reply"
        Array mentions "List of User IDs"
        Boolean isEdited
        Date editedAt
        Boolean isDeleted
        Date deletedAt
        Number replyCount
        Date createdAt
        Date updatedAt
    }

    TASK {
        ObjectId _id PK
        String title
        String status
        Number commentCount
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId actorId FK
        String type "comment | mention"
        String title
        String message
        String entityType "task"
        ObjectId entityId FK
        Boolean isRead
    }
```

---

## 2. Comment Lifecycle & Mention Dispatch Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Collaborator
    participant Client as Frontend (TaskDetailsPage)
    participant API as Express Router / Controller
    participant Service as CommentService
    participant DB as MongoDB (Comments / Tasks)
    participant Notif as NotificationService
    participant Audit as AuditLogService

    User->>Client: Types comment with "@Sarah" and clicks Post (or Ctrl+Enter)
    Client->>API: POST /api/v1/tasks/:taskId/comments { content, parentId, mentions }
    API->>API: Authenticate JWT & Validate Org Header
    API->>Service: createComment(userId, orgId, taskId, payload)
    
    Service->>DB: TaskModel.findById(taskId) -> Verify Tenant & Access
    alt Task Not Found or Wrong Org
        Service-->>API: Throw 404 / 403 Forbidden
        API-->>Client: 403 / 404 Response Envelope
    end

    opt parentId is provided (Threaded Reply)
        Service->>DB: CommentModel.findById(parentId) -> Verify same task
        Service->>DB: CommentModel.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } })
    end

    Service->>Service: Resolve and validate mention user IDs against Org
    Service->>DB: CommentModel.create(newComment)
    Service->>DB: TaskModel.findByIdAndUpdate(taskId, { $inc: { commentCount: 1 } })

    Service->>Audit: AuditLogModel.create({ action: 'comment_created', entityType: 'task', entityId: taskId })
    
    opt Mentions exist
        loop For each valid mentioned User
            Service->>Notif: NotificationModel.create({ type: 'mention', userId, actorId, entityId: taskId })
        end
    end

    opt Notify Task Assignees
        Service->>Notif: NotificationModel.create({ type: 'comment', userId: assigneeId, entityId: taskId })
    end

    Service-->>API: Return Populated Comment (with Author Details)
    API-->>Client: 201 Created { success: true, data: { comment } }
    Client-->>User: Optimistically renders new comment card in feed
```

---

## 3. Comment Deletion & Soft-Delete Preservation Flow

```mermaid
flowchart TD
    Start([User clicks Delete Comment]) --> CheckAuthor{Is User Comment Author or Admin?}
    CheckAuthor -- No --> Deny[Return 403 Forbidden: Cannot delete comment]
    CheckAuthor -- Yes --> ShowModal[Display Workzen Confirmation Modal]
    ShowModal --> Confirm{User confirms deletion?}
    Confirm -- Cancel --> Abort([Cancel & Close Modal])
    Confirm -- Confirm --> CheckReplies{Does Comment have child replies?}
    
    CheckReplies -- Yes --> SoftDelete["Soft Delete: Set isDeleted=true<br/>Set content='[This comment was deleted by author]'<br/>Retain replyCount & reply thread"]
    CheckReplies -- No --> HardOrSoft["Soft Delete or Clean Removal<br/>Mark document isDeleted=true<br/>Decrement parent replyCount if child"]
    
    SoftDelete --> UpdateTaskCount["Decrement Task.commentCount"]
    HardOrSoft --> UpdateTaskCount
    UpdateTaskCount --> LogAudit["Log Audit Trail: comment_deleted"]
    LogAudit --> ReturnSuccess["Return 200 OK Response"]
    ReturnSuccess --> UpdateUI["UI updates to show Soft-Deleted placeholder badge"]
    UpdateUI --> End([Done])
```

