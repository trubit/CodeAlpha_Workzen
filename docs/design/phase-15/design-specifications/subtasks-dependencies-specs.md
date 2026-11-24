# WORKZEN — Phase 15: Subtasks & Dependencies Design Specifications

## 1. Executive Summary & Design System Foundations

Phase 15 introduces robust **Subtask Hierarchies** and **Task Dependencies** to WORKZEN's enterprise project management system. All interfaces strictly adhere to Workzen's design guidelines:
- **Typography**: Inter font scale (`font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Hierarchy Scale**:
  - H1 / Page Header: 24px / 32px line-height, font-weight 700, color `#0F172A`
  - H2 / Section Header: 18px / 24px line-height, font-weight 600, color `#1E293B`
  - H3 / Modal Header / Subsection: 15px / 20px line-height, font-weight 600, color `#334155`
  - Body Regular: 14px / 20px line-height, font-weight 400, color `#475569`
  - Body Semibold: 14px / 20px line-height, font-weight 600, color `#1E293B`
  - Caption / Metadata: 12px / 16px line-height, font-weight 500, color `#64748B`
  - Micro / Badge: 11px / 14px line-height, font-weight 600, uppercase letter-spacing +0.03em
- **Color Tokens**:
  - Primary / Brand: Indigo `#4F46E5` (Hover: `#4338CA`, Active: `#3730A3`, Light: `#EEF2FF`, Border: `#C7D2FE`)
  - Danger / Blocked: Crimson / Rose `#E11D48` (Bg: `#FFF1F2`, Border: `#FECDD3`, Text: `#BE123C`)
  - Warning / In Progress: Amber `#D97706` (Bg: `#FFFBEB`, Border: `#FDE68A`, Text: `#B45309`)
  - Success / Done: Emerald `#059669` (Bg: `#ECFDF5`, Border: `#A7F3D0`, Text: `#047857`)
  - Surface Neutral: `#FFFFFF`, Background: `#F8FAFC`, Border Neutral: `#E2E8F0`

---

## 2. Subtask Architecture & UI Behavior

### 2.1 Hierarchy Model
- **Max 1-Level Nesting**: Root Tasks (`parentId: null/undefined`) can have child subtasks (`parentId: taskId`). Child subtasks cannot have subtasks themselves.
- **Parent Progress Calculation**:
  - Dynamic telemetry calculated in real-time on query from live subtask statuses:
    - `total`: Total active (non-archived) subtasks under parent
    - `completed`: Subtasks in `DONE` status
    - `remaining`: `total - completed`
    - `percentage`: `total > 0 ? Math.round((completed / total) * 100) : 0`
- **Progress Bar Presentation**:
  - Container: 6px height, 9999px border-radius, background `#E2E8F0`
  - Fill: Smooth linear transition (0.3s ease-in-out), background:
    - 0% - 99%: Indigo `#4F46E5`
    - 100%: Emerald `#059669`
  - Counter text: `"3 of 5 completed (60%)"`

### 2.2 Subtask List Controls
- Quick Status Toggle: Circular checkbox (border `#CBD5E1`, filled `#059669` on done with checkmark icon).
- Inline Subtask Creation: One-click `+ Add Subtask` row that converts to an inline input with title, priority badge selector, assignee selector, and keyboard shortcuts (`Enter` to submit, `Esc` to cancel).
- Navigation: Clicking a subtask title navigates to its full detail view or opens its modal drawer.

---

## 3. Dependency Architecture & UI Behavior

### 3.1 Relationship Model
- **Prerequisite ("Blocked By")**: Tasks that must be completed (`DONE`) before the current task can be worked on.
- **Dependent ("Blocks")**: Downstream tasks that are awaiting completion of the current task.
- **Cycle Prevention**:
  - Real-time Depth-First Search (DFS) cycle validation on the server prevents direct (A -> B -> A) and indirect (A -> B -> C -> A) cycles before saving.
  - Returns explicit error with detailed cycle path: `CIRCULAR_DEPENDENCY_DETECTED`.
- **Self-Dependency Rejection**: Tasks cannot block themselves.

### 3.2 Blocked State Telemetry
- A task is dynamically marked `isBlocked = true` if:
  - It has one or more tasks in `blockedByIds` that have `status !== 'done'` and `!isArchived`.
- **Blocked State Presentation**:
  - **Banner in Task Details**: Prominent rose-alert banner stating `"This task is blocked by 2 unfinished prerequisite tasks"`, with direct clickable links to the blocking tasks.
  - **Kanban Board Badge**: Rose badge with Lock icon: `[🔒 Blocked (2)]`.
  - **Task List Indicator**: High-visibility warning badge on row with tooltip listing blocking tasks.

---

## 4. Complete 20-Screen Prototype Catalog

The visual prototype suite covers 20 distinct task states and user journeys across 3 viewports:
1. **Desktop Viewport**: 1920 x 1080 px
2. **Tablet Viewport**: 1024 x 768 px
3. **Mobile Viewport**: 800 x 1200 px (responsive vertical stack)

| Screen # | Screen Title | Key Visual Features & States |
|----------|--------------|------------------------------|
| 01 | Task Details with Active Subtasks | Subtasks card with 5 items (3 done, 2 todo), 60% progress bar, inline "+ Add Subtask" |
| 02 | Task Details with Blocked State Banner | Red/Rose banner indicating 1 unfinished prerequisite, lock icon, direct links to blocker |
| 03 | Task Details with Dependencies Card | Dual sections: "Blocked By (Prerequisites)" & "Blocks (Dependents)" with status badges |
| 04 | Add Dependency Search Modal | Searchable task picker modal with real-time filtering, project scope, and blocker type selection |
| 05 | Circular Dependency Error Modal | Red danger alert modal preventing circular dependency with cycle path visualization |
| 06 | Subtask Inline Quick Add | Active focus state on inline title input, priority picker dropdown, submit and cancel actions |
| 07 | Subtask Completion Interaction | Checkbox state transition from unchecked to checked with strikethrough and emerald badge |
| 08 | All Subtasks Completed (100% Done) | Green progress bar (100%), celebratory completion state, option to mark parent task Done |
| 09 | Empty Subtasks State | Clean zero-data empty state with icon, explanatory copy, and primary "Add First Subtask" button |
| 10 | Empty Dependencies State | Informative empty state explaining prerequisites and dependents with "+ Add Prerequisite" |
| 11 | Kanban Card with Subtasks Progress Badge | Kanban board column with task card displaying `[📋 3/5 subtasks]` progress indicator |
| 12 | Kanban Card with Blocked State Indicator | Kanban card featuring red `[🔒 Blocked]` badge, disabled drag indicator, and blocker tooltip |
| 13 | Task List Table with Subtask Telemetry | Table view showing "Subtasks" column with mini progress bar and "3/5" badge |
| 14 | Task List Table with Blocked Column | Table view displaying dependency status column with red lock pills and hover popover |
| 15 | Remove Dependency Confirmation Dialog | Enterprise modal asking confirmation to decouple dependency relationship |
| 16 | Subtask Detail View with Parent Breadcrumb | Child task view displaying `[Projects / PRJ-01 / WZ-101 Parent / WZ-104 Subtask]` breadcrumbs |
| 17 | Max 1-Level Nesting Warning | UI feedback preventing adding subtasks to a child task ("Subtasks cannot have nested subtasks") |
| 18 | Dependency Chain Visualization | Linear node-link graph showing Task A (Done) -> Task B (In Progress) -> Task C (Blocked) |
| 19 | Batch Subtask Progress Update | Visual state updating parent task progress telemetry dynamically as subtasks toggle |
| 20 | Parent Task Archival with Subtasks Cascade | Modal warning user that archiving the parent task archives all associated subtasks |

