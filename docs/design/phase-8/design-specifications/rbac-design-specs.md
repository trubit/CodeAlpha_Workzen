# WORKZEN — Phase 8: Enterprise RBAC Design & Visual Specifications

---

## 1. Visual Direction & Design Benchmarks
- **Visual Palette:** WORKZEN Slate Dark (`#0B0C10`, `#11131A`, `#181924`, `#202230`, `#2C2E42`) paired with Precision Enterprise Light (`#F8FAFC`, `#FFFFFF`, `#F1F5F9`, `#E2E8F0`).
- **Accent Signals:**
  - Indigo `#6366F1`: Enterprise RBAC core brand, primary actions, and custom roles.
  - Emerald `#10B981`: Granted capabilities, active security policies, verified state.
  - Rose `#F43F5E`: Danger zones, permission-denied blocks (403), role revocation.
  - Sky `#0EA5E9`: Workspace-scoped roles, agile sprint governance.
  - Amber `#F59E0B`: Custom roles, compliance & audit leads, security alerts.
  - Purple `#8B5CF6`: Organization managers, team delegation operations.

---

## 2. Screen Specifications & Responsive Breakpoints

### 2.1 Screen Breakpoints
- **Desktop (1920×1080):** High-density tabular layouts with sticky domain filters, KPI summary cards, side-by-side modal form controls, and live permission counters.
- **Tablet (1024×768):** Flexible 2-column cards, collapsible domain accordions, modal dialog sheets.
- **Mobile (800×1200 / 375×812):** Stacked full-width cards, touch-optimized checkbox hit areas (min 44px), sticky bottom action bars, bottom sheet drawers for assignment confirmation.

### 2.2 Prototype Reference Index
1. `rbac-01-roles-permissions-overview`: Main dashboard displaying all system and custom roles with active assignment telemetry.
2. `rbac-02-default-org-roles`: System built-in immutable roles (Owner, Admin, Manager, Member, Viewer).
3. `rbac-03-custom-role-creation`: Custom role definition modal with anti-privilege escalation verification.
4. `rbac-04-role-editing`: Interactive capability matrix editor with real-time toggle switches.
5. `rbac-05-role-details`: Deep-dive role inspector displaying assigned members, scope, and revocation controls.
6. `rbac-06-permission-assignment`: Granular permission catalogue across 6 domains.
7. `rbac-07-permission-categories`: Detailed governance breakdown for Organization, Workspace, Projects, Tasks, Collaboration, and Reports.
8. `rbac-08-org-role-management`: Organization-level role management view.
9. `rbac-09-workspace-role-management`: Workspace-scoped role management isolated to the active workspace.
10. `rbac-10-user-role-assignment`: Member role management table with quick assignment drawers.
11. `rbac-11-role-assignment-confirm`: Pre-flight security verification dialog before granting elevated privileges.
12. `rbac-12-permission-denied`: Enterprise 403 Access Denied screen with incident tracking metadata.
13. `rbac-13-role-deletion-confirm`: Safeguarded danger zone modal requiring typing the exact role name to confirm deletion.
14. `rbac-14-role-audit-history`: Immutable audit trail showing timestamp, actor, event, target, and security context.
15. `rbac-15-role-management-states`: Empty state, TanStack Query loading skeleton, and error boundary states.

---

## 3. Typography & UI Components
- **Font Stack:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace Stack:** `'JetBrains Mono', 'Fira Code', 'Consolas', monospace` for slugs, permission keys, and audit incident IDs.
- **Micro-Interactions:**
  - Instant toggle switches for capability assignment.
  - Hover states on role cards displaying granted percentage.
  - Live preview of role slug generation from role display name.

