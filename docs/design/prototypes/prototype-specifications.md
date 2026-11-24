# WORKZEN — Prototype Architecture & Governance Specifications

> **Product:** WORKZEN Enterprise SaaS  
> **Tagline:** "Plan Smarter. Work Together. Achieve More."  
> **Directory:** `docs/design/prototypes/`  
> **Purpose:** Formal specifications governing prototype creation, state boundaries, interactive fidelity, and verification across all project phases.

---

## 1. Prototype Core Principles

In Workzen, interactive prototypes are mandatory for every phase to validate user flows, visual hierarchy, ergonomics, and accessibility before backend mutations or live database connections are finalized.

### The 4 Non-Negotiable Prototype Laws:
1. **Isolated Prototype State:**
   - Use realistic sample data exclusively within client-side design prototypes (`src/client/store/` or local state).
   - **Never** seed mock prototype records into the production MongoDB database.
   - **Never** couple live database write operations to prototype interactions.
2. **Authentic Interaction Fidelity:**
   - Prototypes must never be static wireframes or text-only descriptions.
   - They must respond to real user inputs: sidebar expansion, tab selection, modal lifecycles, dropdown menus, filter mutations, and responsive breakpoint adjustments.
3. **Transparent Operational Boundary:**
   - Do **not** create spoofed backend authentication or masquerade client mock state as live production APIs.
   - When a phase transitions from Prototype to Production (e.g., Phase 4 Auth), API contracts must be strictly validated with Zod schemas against real Express endpoints.
4. **Persistent Prototype Hub:**
   - The interactive client incorporates a persistent floating prototype navigator (`PrototypeNavigator.tsx`) allowing reviewers, testers, and stakeholders to jump instantly between all 16 screen states at any time.

---

## 2. Interactive Prototype Screen Inventory

Workzen maintains 16 distinct prototype screens mapped in `src/client/App.tsx`:

| ID | Screen Name | Category | Primary Interactions Supported | Design Reference |
| :--- | :--- | :--- | :--- | :--- |
| `landing` | Public Landing Page | Public & Auth | Hero CTA navigation, feature cards, sign-in/register routing | Flowstack / Loqo |
| `login` | Login Portal | Public & Auth | Form validation state, password reveal, forgot password modal | Modern SaaS Auth |
| `register` | Organisation Registration | Public & Auth | Multi-step tenant form, password strength meter, terms toggle | Multi-Tenant Onboarding |
| `enterprise_dashboard` | Executive Dashboard | Dashboards | High-level metrics, org overview, system health quick-links | FlowTask (Reference 1) |
| `org_dashboard` | Organisation Hub | Dashboards | Workspace directory, member counters, plan usage meters | Enterprise Multi-Tenant |
| `workspace_dashboard` | Workspace Overview | Dashboards | Active projects, recent task lists, team activity stream | ClickUp / Asana |
| `project_overview` | Project Portfolio | Dashboards | Portfolio health, sprint milestones, status breakdown | Monday.com |
| `kanban` | Kanban Board | Workflows | Column task counters, priority pills, add task modal | Scopeboard (Reference 2) |
| `task_details` | Task Deep Dive | Workflows | Priority selector, status pill update, subtasks, activity log | Linear / Jira |
| `calendar` | Sprint Calendar | Workflows | Month/week view toggle, deadline indicators, date selection | Asana Calendar |
| `analytics` | Reports & Velocity | Workflows | Spline completion wave chart, status donut, team workload | FlowTask & TaskGenius |
| `team` | Team & Directory | Admin & DevOps | Member table, role badges, invite modal trigger | Enterprise RBAC |
| `notifications` | Notification Centre | Admin & DevOps | Mark all as read, tab filters (All, Mentions, Alerts) | Slack / Linear Inbox |
| `settings` | Settings & Security | Admin & DevOps | Tenant settings, audit log, theme toggle, API keys | SOC2 Compliance UI |
| `billing` | Billing & Plans | Admin & DevOps | Plan comparison cards, Stripe/Paystack readiness, usage tiers | SaaS Subscription |
| `dev_setup` | Dev Setup & Health | Admin & DevOps | Live backend DB latency, memory graph, environment check | Phase 2 Infrastructure |

---

## 3. Required Interaction Patterns

Every prototype screen must support the following interaction primitives:

1. **Sidebar & Tab Navigation:**
   - Active view highlighting (`#4F46E5` primary background).
   - Instant view switching without page refresh lag.
2. **Modals & Overlays:**
   - Task creation modal with form validation.
   - User invitation modal with role select (`Admin`, `Member`, `Viewer`).
   - Clean backdrop blur and keyboard escape dismissal.
3. **Kanban & Card Interactions:**
   - Hover lift micro-interactions (`translateY(-2px)` + shadow elevation).
   - Priority badges with standardized tint backgrounds (`Urgent`, `High`, `Medium`, `Low`).
   - Status indicators with colored status dots (`Done`, `In Progress`, `Review`, `To Do`).
4. **Data Visualizations:**
   - Vector SVG bezier curve completion charts.
   - Mathematical SVG stroke-dashoffset circular donuts.
   - Dynamic workload meters with percentage fill transitions.
5. **Responsive Behaviors:**
   - Desktop: Persistent $260\text{px}$ sidebar + top utility bar.
   - Mobile: Hidden sidebar + fixed bottom navigation bar (`MobileNav.tsx`) with thumb-friendly quick "+" action button.

---

## 4. Phase-by-Phase Prototype Roadmap

When implementing future phases, the following prototype verification gates must be cleared:

- **Phase 4 (Authentication & Multi-Tenant Onboarding):**
  - Verify Login & Registration prototype screens against real Zod schemas.
  - Wire real JWT access/refresh token lifecycle while preserving demo switcher capabilities.
- **Phase 5 (Organisations, Workspaces & RBAC):**
  - Verify Org Dashboard and Workspace Dashboard screens with real tenant-scoped Mongoose queries.
- **Phase 6 (Projects, Task Engine & Kanban):**
  - Connect the Kanban Board and Task Details prototypes to live REST API endpoints and Socket.IO events.
- **Phase 7 (Reports, Analytics & Exports):**
  - Bind live MongoDB aggregation pipelines to the `ReportsAnalyticsPage` charts.

