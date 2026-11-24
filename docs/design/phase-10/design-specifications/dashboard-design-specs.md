# WORKZEN — Phase 10: Enterprise Dashboard Design Specifications

## 1. Overview & System Goals

The WORKZEN Enterprise Dashboard serves as the central operational hub for cross-functional engineering, product, and leadership teams. It unifies project tracking, sprint delivery metrics, personalized task queues, collaborative activity streams, and milestone forecasting into an intuitive, responsive, and role-adapted interface.

---

## 2. Typographic Scale & Design Tokens (Inter Primary)

Standardized on the **Inter** typography system with reliable sans-serif system fallbacks.

| Token / Class | Size | Weight | Line Height | Letter Spacing | Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `.wz-display-heading` | 2.5rem (40px) | 800 (Bold) | 1.15 | -0.025em | Dashboard Hero Title |
| `.wz-page-heading` | 1.75rem (28px) | 700 (Bold) | 1.25 | -0.02em | Section & Module Titles |
| `.wz-section-heading`| 1.25rem (20px) | 600 (Semibold)| 1.35 | -0.01em | Card Header / Sub-section |
| `.wz-card-heading` | 1.05rem (16.8px)| 600 (Semibold)| 1.4 | normal | Widget Headings |
| `.wz-body` | 0.9375rem (15px)| 400 (Regular) | 1.55 | normal | Main Data & Descriptions |
| `.wz-description` | 0.875rem (14px) | 400 (Regular) | 1.5 | normal | Explanatory Text & Metadata |
| `.wz-label` | 0.8125rem (13px)| 600 (Semibold)| 1.3 | +0.01em | KPI Metric Titles & Labels |
| `.wz-caption` | 0.75rem (12px) | 600 (Semibold)| 1.2 | +0.02em | Status Chips & Timestamps |

---

## 3. 20 Required Dashboard Prototype Screens

| Screen # | Prototype Key | Screen Title | Key Functional Scope |
| :--- | :--- | :--- | :--- |
| **01** | `proto-01-main-enterprise-dashboard` | Main Enterprise Dashboard | Executive portfolio overview, high-level metrics, sprint velocity |
| **02** | `proto-02-organization-overview` | Organization Overview | Tenant health, member allocation, plan limits, security posture |
| **03** | `proto-03-workspace-overview` | Workspace Overview | Workspace-scoped multi-squad command center and project backlogs |
| **04** | `proto-04-project-summary` | Project Summary | Live health, milestone progress, burndowns, and task ratios |
| **05** | `proto-05-task-overview` | Task Overview | Kanban stage distribution: Backlog, Todo, In Progress, Review, Done |
| **06** | `proto-06-my-tasks` | My Tasks | Personalized assigned deliverables, priority chips, focus queue |
| **07** | `proto-07-team-overview` | Team Overview | Active squad contributors, pending invites, workload distribution |
| **08** | `proto-08-recent-activity` | Recent Activity | Immutable audit log stream with actor attribution and timestamps |
| **09** | `proto-09-upcoming-deadlines` | Upcoming Deadlines | Overdue alerts, today's targets, 7-day milestone forecast |
| **10** | `proto-10-task-status-distribution` | Task Status Distribution | Visual distribution across workflow states with completion ratios |
| **11** | `proto-11-project-progress-overview` | Project Progress Overview | Calculated delivery percentages from genuine closed deliverables |
| **12** | `proto-12-dashboard-filters` | Dashboard Filters | Context bar: Workspace selector, Project filter, Priority, Assignee |
| **13** | `proto-13-date-range-selection` | Date-Range Selection | Temporal range filtering: Today, 7 Days, 30 Days, Custom range |
| **14** | `proto-14-personalized-dashboard` | Personalized Dashboard | Role-adapted layout customized to authenticated contributor |
| **15** | `proto-15-owner-admin-dashboard` | Owner / Admin Dashboard | Unrestricted oversight, security governance, team invites, audit logs |
| **16** | `proto-16-manager-dashboard` | Manager Dashboard | Sprint management, team allocation, blocker mitigation, reviews |
| **17** | `proto-17-member-dashboard` | Member Dashboard | Streamlined contributor view prioritizing assigned work and comments |
| **18** | `proto-18-empty-dashboard` | Empty Dashboard | Honest zero-data empty state guiding project and task initialization |
| **19** | `proto-19-loading-dashboard` | Loading Dashboard | Accessible skeleton screens during asynchronous data queries |
| **20** | `proto-20-error-permission-denied` | Error & Permission Denied | Resilient handling of unauthorized scopes and network issues |

---

## 4. Responsive Breakpoints

- **Desktop (>= 1200px):** Full multi-column dashboard with fixed sidebar, top navigation, KPI grid (4 columns), dual-column main workstream, and activity side panel.
- **Tablet (768px - 1199px):** 2x2 metric grid, full-width main cards, collapsible navigation drawer.
- **Mobile (< 768px):** Single-column stacked layout, horizontal swipeable metric cards, sticky mobile navigation bar (`MobileNav`), touch-optimized 44px tap targets.

