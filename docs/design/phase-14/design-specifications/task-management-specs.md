# WORKZEN — PHASE 14: TASK MANAGEMENT
## Comprehensive Design Specifications & Prototype Catalog

---

### 1. Typography Standards

All Phase 14 interfaces strictly enforce the **Inter** typeface with cross-platform fallback to modern system sans-serif.

| Token | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `display-1` | 24px (1.5rem) | 700 (Bold) | 1.25 | Task details title, page main headers |
| `title-lg` | 18px (1.125rem) | 700 (Bold) | 1.3 | Modal headers, section headings |
| `title-md` | 15px (0.9375rem) | 600 (SemiBold) | 1.35 | Table column headers, card titles |
| `body-md` | 13px (0.8125rem) | 400 (Regular) | 1.45 | Primary table rows, description body |
| `body-bold` | 13px (0.8125rem) | 600 (SemiBold) | 1.45 | Emphasized row labels, author names |
| `caption` | 11.5px (0.71875rem) | 500 (Medium) | 1.3 | Metadata labels, relative timestamps |
| `mono-code` | 11.5px (0.71875rem) | 600 (SemiBold) | 1.2 | Formatted task keys (`PLAT-102`, `ENG-40`) |

---

### 2. Design Color Tokens

| Semantic Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| `canvas-bg` | `#F8FAFC` | Page body and view backdrop |
| `surface-card` | `#FFFFFF` | Table containers, modal cards, details panels |
| `surface-subtle` | `#F1F5F9` | Hover states, disabled inputs, background stripes |
| `border-default` | `#E2E8F0` | Default container and table dividers |
| `brand-primary` | `#4F46E5` | Primary buttons, active tabs, selected states |
| `brand-hover` | `#4338CA` | Hover state for primary buttons |
| `status-backlog` | `#64748B` | Slate for backlog items |
| `status-todo` | `#3B82F6` | Sky blue for to-do items |
| `status-in-progress` | `#6366F1` | Indigo for active in-flight tasks |
| `status-review` | `#F59E0B` | Amber for items under code/design review |
| `status-done` | `#10B981` | Emerald green for verified completed tasks |
| `priority-urgent` | `#EF4444` | High-contrast crimson for blockers |
| `priority-high` | `#F97316` | Orange for critical path deliverables |
| `priority-medium` | `#3B82F6` | Blue for normal sprint work items |
| `priority-low` | `#64748B` | Slate for minor improvements |

---

### 3. Viewports & Responsive Layouts

1. **Desktop (`1920 x 1080`):**
   - 260px fixed dark sidebar navigation.
   - Comprehensive multi-column task table with rich inline actions.
   - Split view or modal drawer for full task details and audit trail.
2. **Tablet (`1024 x 768`):**
   - 200px collapsed sidebar.
   - Fluid responsive table with horizontal overflow scrolling and sticky task titles.
3. **Mobile (`800 x 1200`):**
   - Off-canvas drawer navigation.
   - Stacked card-based list layout with touch targets (&ge; 44px) for rapid mobile triaging.

---

### 4. 20-Screen High-Fidelity Prototype Catalog

Each state is rendered across Desktop, Tablet, and Mobile (60 total prototype images):

| # | Prototype Screen Identifier | State Description |
| :-: | :--- | :--- |
| 1 | `01-task-list-overview` | Main task table view with active project tasks, badges, and counters |
| 2 | `02-create-task-modal` | Modal dialog for creating a new task with project scope and member assignees |
| 3 | `03-edit-task-modal` | Full edit modal supporting title, description, dates, priority, and assignees |
| 4 | `04-task-details-view` | Comprehensive task details page with metadata, dates, and audit trail |
| 5 | `05-task-assignment-dropdown` | Real member assignee picker with avatars, roles, and search |
| 6 | `06-status-priority-controls` | Inline quick-change controls for task status and urgency |
| 7 | `07-search-filtering-toolbar` | Multi-facet filtering toolbar (project, status, priority, assignee, due date) |
| 8 | `08-filtered-results-view` | Filtered task list isolating specific assignees and critical deadlines |
| 9 | `09-sorting-interaction` | Sorting columns by task key, title, priority, due date, and updated time |
| 10 | `10-bulk-selection-actions` | Checkbox multi-select with bulk status change and archive actions |
| 11 | `11-empty-task-list` | Honest empty state when no tasks exist in the workspace |
| 12 | `12-no-filter-matches` | Zero-results state with clear feedback and one-click "Reset Filters" action |
| 13 | `13-task-archive-confirmation` | Confirmation modal for safely archiving a completed or deprecated task |
| 14 | `14-archived-tasks-view` | Dedicated archived tasks view with restore or permanent delete options |
| 15 | `15-permanent-delete-modal` | Explicit confirmation modal for permanent task deletion (RBAC-guarded) |
| 16 | `16-task-activity-history` | Real audit logging history panel showing creations, status changes, and edits |
| 17 | `17-task-loading-skeleton` | Shimmer loading skeleton during asynchronous API retrieval |
| 18 | `18-error-permission-denied` | Permission denied and tenant boundary validation error state |
| 19 | `19-mobile-task-card-list` | Touch-optimized card list layout for mobile screens |
| 20 | `20-mobile-task-details-drawer` | Bottom sheet task details drawer for mobile devices |

