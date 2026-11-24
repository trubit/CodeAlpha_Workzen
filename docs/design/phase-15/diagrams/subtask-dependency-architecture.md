# Phase 15: Subtask & Dependency Architecture Diagrams

## 1. Entity Relationship & Data Model

```mermaid
erDiagram
    ORGANISATION ||--o{ TASK : scopes
    WORKSPACE ||--o{ TASK : scopes
    PROJECT ||--o{ TASK : contains
    USER ||--o{ TASK : creates
    USER ||--o{ TASK : assigned_to

    TASK ||--o{ TASK : "parent-child (parentId)"
    TASK }o--o{ TASK : "prerequisite (blockedByIds)"

    TASK {
        ObjectId _id PK
        string taskNumber
        string title
        string description
        string status
        string priority
        ObjectId organisationId FK
        ObjectId workspaceId FK
        ObjectId projectId FK
        ObjectId creatorId FK
        ObjectId assigneeId FK
        ObjectId parentId FK "Null for root tasks, references Task for subtasks"
        Array blockedByIds FK "Array of Task ObjectIds that must be DONE"
        boolean isArchived
        number order
        Date dueDate
        Date createdAt
        Date updatedAt
    }
```

## 2. Parent-Child Subtask Hierarchy & 1-Level Depth Rule

```mermaid
graph TD
    Root[Root Task: parentId = null]
    Sub1[Subtask 1: parentId = Root.id]
    Sub2[Subtask 2: parentId = Root.id]
    Sub3[Subtask 3: parentId = Root.id]
    InvalidSub[Nested Subtask: parentId = Sub1.id]

    Root -->|Permitted| Sub1
    Root -->|Permitted| Sub2
    Root -->|Permitted| Sub3
    Sub1 -.->|REJECTED: 400 Max 1-Level Nesting| InvalidSub

    classDef valid fill:#EEF2FF,stroke:#4F46E5,stroke-width:2px;
    classDef error fill:#FFF1F2,stroke:#E11D48,stroke-width:2px;
    class Root,Sub1,Sub2,Sub3 valid;
    class InvalidSub error;
```

## 3. Depth-First Search (DFS) Cycle Detection Algorithm

```mermaid
flowchart TD
    Start([User requests: Add Task B as Prerequisite to Task A]) --> CheckSelf{Is A == B?}
    CheckSelf -- Yes --> RejectSelf[Reject 400: Task cannot depend on itself]
    CheckSelf -- No --> InitDFS[Run DFS Cycle Detection: Trace prerequisites of B]
    
    InitDFS --> Traverse[Traverse B's blockedByIds recursively]
    Traverse --> EncounterA{Does B or its prerequisites reach A?}
    
    EncounterA -- Yes --> CycleDetected[Cycle Detected! Path: A -> B -> ... -> A]
    CycleDetected --> RejectCycle[Reject 400: CIRCULAR_DEPENDENCY_DETECTED]
    
    EncounterA -- No --> ValidDep[Graph is Acyclic DAG]
    ValidDep --> Persist[Push B into A.blockedByIds & Save to MongoDB]
    Persist --> Recalc[Recalculate Dynamic isBlocked Telemetry]
    Recalc --> Done([Complete: Dependency Established])

    classDef step fill:#EEF2FF,stroke:#4F46E5,stroke-width:1px;
    classDef reject fill:#FFF1F2,stroke:#E11D48,stroke-width:2px;
    classDef accept fill:#ECFDF5,stroke:#059669,stroke-width:2px;

    class CheckSelf,InitDFS,Traverse,EncounterA,Persist,Recalc step;
    class RejectSelf,CycleDetected,RejectCycle reject;
    class ValidDep,Done accept;
```

## 4. Blocked State Machine & Telemetry Derivation

```mermaid
stateDiagram-v2
    [*] --> EvaluatingDependencies

    state EvaluatingDependencies {
        [*] --> CheckBlockedByIds
        CheckBlockedByIds --> NoPrereqs : blockedByIds is empty
        CheckBlockedByIds --> InspectPrereqs : blockedByIds has items
        
        InspectPrereqs --> CheckStatuses : Fetch prerequisite tasks from DB
        CheckStatuses --> AllDone : All prerequisites status == 'done' or archived
        CheckStatuses --> UnfinishedExists : At least 1 prerequisite status != 'done' and not archived
    }

    NoPrereqs --> Unblocked : isBlocked = false
    AllDone --> Unblocked : isBlocked = false
    UnfinishedExists --> Blocked : isBlocked = true

    state Blocked {
        Banner: Display Warning Banner in Task Details
        Badge: Display [🔒 Blocked] Badge in Kanban Card & Task List
        Tooltip: List Blocking Tasks
    }

    state Unblocked {
        Actionable: Normal Workflow Allowed
        StatusTag: Ready / In Progress / Done
    }
```

