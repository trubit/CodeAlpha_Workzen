# WORKZEN — Phase 13: Kanban Board Design Specifications

## 1. Architectural Overview & Design System

The WORKZEN Sprint Kanban Board provides high-velocity agile teams with an interactive, real-time board for organizing, tracking, and prioritizing project tasks. It integrates directly with Phase 8 RBAC, Phase 11 Project Management, Phase 12 Project Members & Collaboration, and Phase 10 Enterprise Telemetry.

### Primary Design Pillars
- **Strict Data Truth (No Dummy Data)**: Every column count, card, assignee, and status transition is persisted in MongoDB and verified against genuine backend API responses.
- **Fluid & Accessible Drag-and-Drop**: Native HTML5 drag-and-drop combined with keyboard-accessible quick-shift controls ensures WCAG 2.1 AA compliance.
- **Inter Typography**: Standardized font weights and scales for readable card density across enterprise boards.
- **Optimistic Movement with Safe Rollback**: Task movement updates the UI instantly, synchronizes to MongoDB via REST and broadcasts via Socket.IO, rolling back cleanly if the server rejects an unauthorized change.

---

## 2. Typographic Hierarchy (Inter Centric)

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Board Title | 20px (1.25rem) | 700 (Bold) | 28px | Project Board Header |
| Column Title | 14px (0.875rem) | 700 (Bold) | 20px | Stage Name (To Do, In Progress, etc.) |
| Task Title | 13px (0.8125rem) | 600 (SemiBold) | 18px | Kanban Card Primary Title (2 lines max) |
| Task Key | 11px (0.6875rem) | 700 (Bold) | 14px | Project Prefix Identifier (e.g., `PLAT-102`) |
| Metadata / Tags | 11px (0.6875rem) | 500 (Medium) | 14px | Due Date, Tag Badges, Subtask counts |
| Micro Badge | 10px (0.625rem) | 700 (Bold) | 12px | Priority Tags (Urgent, High, Medium, Low) |

---

## 3. Workflow Column Specifications & Status Mapping

The default enterprise sprint workflow is partitioned into four primary columns corresponding to `TASK_STATUS`:

| Column ID | Label | Accent Color | Subtle Surface | Status Value |
|---|---|---|---|---|
| `todo` | **To Do** | `#0EA5E9` (Sky 500) | `#F0F9FF` (Sky 50) | `TASK_STATUS.TODO` |
| `in_progress` | **In Progress** | `#4F46E5` (Indigo 600) | `#EEF2FF` (Indigo 50) | `TASK_STATUS.IN_PROGRESS` |
| `review` | **In Review** | `#F59E0B` (Amber 500) | `#FFFBEB` (Amber 50) | `TASK_STATUS.REVIEW` |
| `done` | **Completed** | `#10B981` (Emerald 500) | `#ECFDF5` (Emerald 50) | `TASK_STATUS.DONE` |

*(Note: `TASK_STATUS.BACKLOG` is accessible via project backlog views or optional column configuration).*

---

## 4. Priority Color Tokens & Urgency Matrix

- **Urgent**: `#EF4444` (Rose 500) / Surface: `#FEF2F2` (Rose 50)
- **High**: `#F59E0B` (Amber 500) / Surface: `#FFFBEB` (Amber 50)
- **Medium**: `#4F46E5` (Indigo 600) / Surface: `#EEF2FF` (Indigo 50)
- **Low**: `#64748B` (Slate 500) / Surface: `#F1F5F9` (Slate 100)

---

## 5. 22 High-Fidelity Prototype Screen Catalog

Rendered across Desktop (`1920x1080`), Tablet (`1024x768`), and Mobile (`800x1200`):

1. **`01-main-kanban-board`**: Full sprint board with real-time column counts, task cards, and quick actions.
2. **`02-multiple-workflow-columns`**: Standard 4-column layout (`To Do`, `In Progress`, `In Review`, `Completed`).
3. **`03-task-card-design`**: Card structure with task key, priority badge, description preview, tags, and footer.
4. **`04-card-assignee-info`**: Collaborator avatars with initials and tooltips for multi-member assignments.
5. **`05-card-priority-due-date`**: Overdue warnings, milestone target dates, and urgency badges.
6. **`06-column-creation-editing`**: Column configuration options, WIP limits, and custom column titles.
7. **`07-board-status-configuration`**: Mapping workflow columns to underlying enterprise task statuses.
8. **`08-drag-drop-interaction`**: Active drag ghost, dashed blue drop target, and visual placement indicators.
9. **`09-task-movement-feedback`**: Toast confirmation for successful movements with automatic rollback on error.
10. **`10-board-filter-toolbar`**: Combined filter bar featuring search, priority, assignee, and due-date filters.
11. **`11-task-search-view`**: Real-time debounced query filtering across card titles and task keys.
12. **`12-assignee-filtering`**: Board filtered to display only tasks assigned to specific project collaborators.
13. **`13-priority-filtering`**: Critical path view isolating urgent and high-priority cards.
14. **`14-due-date-filtering`**: Filter options for Overdue, Due Today, and Current Sprint milestones.
15. **`15-board-sorting`**: Column ordering criteria (Priority, Due Date, Manual Order, Newest First).
16. **`16-project-board-selection`**: Dropdown switcher for navigating across squad projects in the workspace.
17. **`17-board-loading-skeleton`**: Animated pulse placeholder columns and cards during data fetching.
18. **`18-empty-board-state`**: Professional empty state with a "+ Create First Task" initialization button.
19. **`19-no-matching-tasks`**: Zero-result feedback when active search or filters match zero cards.
20. **`20-error-permission-denied`**: Access denied and authorization failure notifications for restricted projects.
21. **`21-mobile-kanban-experience`**: Responsive mobile view with tabbed column selector and stacked cards.
22. **`22-accessible-movement-alternative`**: Dropdown menu on each card enabling keyboard-only status shifts.

