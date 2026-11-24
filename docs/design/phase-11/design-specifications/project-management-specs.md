# WORKZEN — Phase 11: Project Management Design Specifications

## 1. Overview & System Purpose

The Project Management module allows cross-functional teams, squad managers, and enterprise administrators to create, govern, prioritize, and track initiatives across workspaces. It unifies project discovery, milestone roadmaps, member allocations, visibility controls, and audit streams with real MongoDB persistence.

---

## 2. Typographic Scale & Design Tokens (Inter Primary)

Standardized on the **Inter** typography system with reliable sans-serif system fallbacks.

| Token / Class | Size | Weight | Line Height | Letter Spacing | Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `.wz-display-heading` | 2.5rem (40px) | 800 (Bold) | 1.15 | -0.025em | Project Hero Title |
| `.wz-page-heading` | 1.75rem (28px) | 700 (Bold) | 1.25 | -0.02em | Section & Module Titles |
| `.wz-section-heading`| 1.25rem (20px) | 600 (Semibold)| 1.35 | -0.01em | Card Header / Sub-section |
| `.wz-card-heading` | 1.05rem (16.8px)| 600 (Semibold)| 1.4 | normal | Project Item Cards |
| `.wz-body` | 0.9375rem (15px)| 400 (Regular) | 1.55 | normal | Description & Prose |
| `.wz-description` | 0.875rem (14px) | 400 (Regular) | 1.5 | normal | Form Helper Text |
| `.wz-label` | 0.8125rem (13px)| 600 (Semibold)| 1.3 | +0.01em | Status Chips & Table Headers |
| `.wz-btn-text` | 0.875rem (14px) | 600 (Semibold)| 1.2 | +0.01em | Action Buttons & CTAs |
| `.wz-caption` | 0.75rem (12px) | 600 (Semibold)| 1.2 | +0.02em | Badges, Keys & Timestamps |

---

## 3. 25 Required Prototype Screens Catalog

| # | Prototype Key | Screen Title | Functional Scope |
| :- | :--- | :--- | :--- |
| **01** | `proto-01-project-management-overview` | Projects Command Center | Unified portfolio overview, active initiatives, squad distribution |
| **02** | `proto-02-project-directory` | Initiative Directory & Grid | Searchable project cards and tabular directory with progress bars |
| **03** | `proto-03-project-creation` | Create New Initiative Modal | Name, key generator, workspace, lead, priority, dates, and color |
| **04** | `proto-04-project-details` | Project Command Hub | Deep dive into an individual project's milestones, team, and deliverables |
| **05** | `proto-05-project-overview-tab` | Initiative Milestone & Progress | Progress bar calculation based on real closed deliverables |
| **06** | `proto-06-project-editing` | Update Properties & Metadata | In-place mutation of title, key, color, description, and dates |
| **07** | `proto-07-project-settings` | Governance & Access Settings | Workspace reassignment, visibility toggles, and deletion boundaries |
| **08** | `proto-08-project-description-objectives` | Project Charter & Scope | Rich descriptions, objectives, deliverables checklist, and targets |
| **09** | `proto-09-project-status-management` | Lifecycle & Status Transitions | Planning -> Active -> On Hold -> Completed -> Cancelled -> Archived |
| **10** | `proto-10-project-priority-management` | Strategic Priority Matrix | Urgent, High, Medium, Low workload tiers with visual indicators |
| **11** | `proto-11-project-start-due-dates` | Schedule & Target Dates | Temporal schedule tracking with overdue detection |
| **12** | `proto-12-project-owner-assignment` | Project Lead Assignment | Explicit leadership delegation to verified organization members |
| **13** | `proto-13-project-member-management` | Contributor Squad Roster | Adding and removing contributors from the project workspace roster |
| **14** | `proto-14-project-visibility-settings` | Confidentiality Settings | Workspace-wide collaboration vs. restricted invite-only mode |
| **15** | `proto-15-project-archive` | Project Archival Confirmation | Soft-archival flow preserving all historical audit records |
| **16** | `proto-16-archived-projects` | Archived Initiatives Vault | Filterable repository of closed and archived projects |
| **17** | `proto-17-project-restoration` | Reactivate & Restore | Re-enabling an archived initiative back into active workspace views |
| **18** | `proto-18-project-deletion-confirmation` | Danger Zone: Safe Deletion | Guard requiring typed project name confirmation to prevent accidental loss |
| **19** | `proto-19-project-activity-history` | Immutable Audit History | Cryptographic log of creation, status changes, and squad mutations |
| **20** | `proto-20-project-search-filtering` | Search & Multi-Filter Bar | Real-time search by keyword, workspace, lead, priority, and status |
| **21** | `proto-21-project-sorting-pagination` | Sorting & Pagination Controls | Ordering by Recently Updated, Name, Target Date, or Progress |
| **22** | `proto-22-project-empty-state` | Zero Initiatives Empty State | Honest empty state with guidance to create the first project |
| **23** | `proto-23-project-loading-state` | Accessible Skeleton Loading | Non-blocking skeleton matrices during data loading |
| **24** | `proto-24-project-validation-error` | Validation Error & Schema Guard | Inline alerts for duplicate keys, missing names, or invalid dates |
| **25** | `proto-25-permission-denied` | Restricted Access Boundary | Cryptographic RBAC enforcement for unauthorized workspace queries |

---

## 4. Responsive Breakpoints

- **Desktop (>= 1200px):** 3-column project directory cards or full data table with status badges and live progress bars.
- **Tablet (768px - 1199px):** 2-column project cards, responsive filter bar.
- **Mobile (< 768px):** Single-column stacked cards, full-width touch-friendly action buttons (44px min height), collapsible filters.

