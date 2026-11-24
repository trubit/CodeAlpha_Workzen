# WORKZEN — Phase 12: Project Members & Collaboration Design Specifications

## 1. Architectural Overview & Design System

The Project Members & Collaboration module gives enterprise teams precise control over project access, squad participation, and role boundaries. It integrates directly with the Phase 8 RBAC engine, Phase 9 Team Management, and Phase 11 Project Management systems.

### Primary Design Pillars
- **Honest Zero-States**: No fabricated collaborators, synthetic stats, or mock counts.
- **Role Transparency**: Immediate visual distinction between `Project Lead` (Owner), `Contributor`, and `Observer`.
- **Tenant Isolation**: Only members of the parent organization can be added to the project roster.
- **Inter Typography**: Pure Inter font hierarchy for readable enterprise density.

---

## 2. Typographic Scale (Inter Centric)

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display / H1 | 24px (1.5rem) | 700 (Bold) | 32px | Page / Modal Primary Heading |
| Section / H2 | 18px (1.125rem) | 600 (SemiBold) | 26px | Card Title, Roster Header |
| Subsection / H3 | 14px (0.875rem) | 600 (SemiBold) | 20px | Table Column Headers, Form Labels |
| Body Regular | 14px (0.875rem) | 400 (Regular) | 20px | Member Names, Explanatory Copy |
| Small Text | 12px (0.75rem) | 500 (Medium) | 16px | Email, Joined Timestamps, Badges |
| Micro / Caption | 11px (0.6875rem) | 600 (SemiBold) | 14px | Status Indicators, Role Tags |

---

## 3. Color Tokens & Semantic Usage

- **Canvas Background**: `#F8FAFC` (Slate 50)
- **Card Surface**: `#FFFFFF` (Pure White)
- **Elevated Hover Surface**: `#F1F5F9` (Slate 100)
- **Border / Divider**: `#E2E8F0` (Slate 200)
- **Primary Brand**: `#4F46E5` (Indigo 600)
- **Project Lead / Active Status**: `#10B981` (Emerald 500)
- **Warning / Demotion**: `#F59E0B` (Amber 500)
- **Destructive / Remove Member**: `#EF4444` (Rose 500)
- **Observer / Read-Only Role**: `#0EA5E9` (Sky 500)
- **Dark Text**: `#0F172A` (Slate 900)
- **Muted Text**: `#64748B` (Slate 500)

---

## 4. 20 High-Fidelity Prototype Screen Catalog

Each screen has been rendered across Desktop (`1920x1080`), Tablet (`1024x768`), and Mobile (`800x1200`):

1. **`01-project-members-overview`**: Metric cards (Collaborators, Leads, Pending), lead badge, and collaboration summary.
2. **`02-project-member-directory`**: Searchable table displaying avatar, name, email, project role, joined date, and actions.
3. **`03-add-project-members`**: Modal interface with multi-select checkboxes for adding eligible organization teammates.
4. **`04-select-org-members`**: Filtered dropdown showing available organization members who are not yet added.
5. **`05-member-invitation-flow`**: Integration linking to organization-level invitations when teammates are not yet in the org.
6. **`06-member-profile-modal`**: Compact view showing member details, assigned role, and participation tenure.
7. **`07-project-owner-info`**: Visual highlight of the project owner with protected removal status and transfer option.
8. **`08-member-roles-access`**: Matrix presenting privileges of Lead (Admin), Contributor (Editor), and Observer (Viewer).
9. **`09-membership-management`**: Comprehensive control panel allowing role changes, batch additions, and removals.
10. **`10-update-member-role`**: Modal dialog for changing member role between Contributor and Observer with live permission impact.
11. **`11-remove-member-confirm`**: Destructive confirmation modal detailing task persistence and access revocation.
12. **`12-access-denied-state`**: Clean error card for restricted projects where the caller lacks membership.
13. **`13-member-search`**: Live instant search by collaborator name or email address.
14. **`14-member-filtering`**: Facet chips to filter roster by Lead, Contributor, or Observer.
15. **`15-collaboration-overview`**: Team distribution by role, workload status, and recent contributions.
16. **`16-empty-membership-state`**: Professional empty state when a project has only its creator assigned.
17. **`17-loading-state`**: Slate skeleton placeholders for metrics, table rows, and member cards.
18. **`18-validation-error-states`**: Validation banners for duplicate membership attempts and owner removal blocks.
19. **`19-membership-activity-log`**: Audit history tracking member additions, removals, and role updates.
20. **`20-mobile-membership-mgmt`**: Stacked responsive card layout optimized for touch interaction on mobile screens.

---

## 5. Security & Multi-Tenant Authorization Rules

- **Strict Tenant Scoping**: Only users with active memberships in the parent organization can be added to a project.
- **Owner Protection**: The project owner (`ownerId`) cannot be removed from the project roster. Ownership must be transferred first.
- **RBAC Authority**: Only users with `project:update` or `project:manage_members` permissions (or Organization Owner / Admin, or Project Lead) can add members, change roles, or remove members.
- **Audit Logging**: Every membership mutation generates an immutable `AuditLog` record (`PROJECT_MEMBERS_ADDED`, `PROJECT_MEMBER_REMOVED`, `PROJECT_MEMBER_ROLE_UPDATED`).

