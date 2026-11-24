# WORKZEN — Phase 9: Enterprise Team Management Design Specifications

## 1. Overview & System Principles
The WORKZEN Team Management system provides an enterprise-grade administration hub for managing organization members, cryptographic email invitations, workspace memberships, and status lifecycle operations.

It integrates directly with the **Phase 8 Role-Based Access Control (RBAC)** engine to enforce granular permissions (`org:manage_members`, `org:manage_roles`, `workspace:manage_access`) and tenant isolation.

---

## 2. Palette & Visual Token Hierarchy
- **Canvas / Background**: `#F8FAFC` (Light Enterprise Canvas) / `#0B0C10` (Dark Canvas)
- **Cards & Surfaces**: `#FFFFFF` (Surface Card) / `#181924` (Dark Card)
- **Primary Brand / Accent**: `#6366F1` (Indigo 500)
- **Role Tier Accents**:
  - Owner: `#4F46E5` (Indigo Deep)
  - Admin: `#8B5CF6` (Purple 500)
  - Manager: `#10B981` (Emerald 500)
  - Member: `#0EA5E9` (Sky 500)
  - Guest/Viewer: `#64748B` (Slate Muted)
- **Status Identifiers**:
  - Active: `#10B981` (Emerald) with soft background `#ECFDF5`
  - Pending: `#F59E0B` (Amber) with soft background `#FFFBEB`
  - Suspended / Deactivated: `#F43F5E` (Rose) with soft background `#FFF1F2`
- **Typography**: Segoe UI, -apple-system, BlinkMacSystemFont; High readability metrics for tables and cards.

---

## 3. High-Fidelity Prototype Screen Manifest
All high-fidelity visual prototypes have been rendered and saved under `docs/design/phase-9/prototypes/` (with implementation captures in `docs/design/phase-9/screenshots/`):

1. **`team-01-team-management-overview-desktop.png` / `-mobile.png`**:
   - Executive dashboard presenting active member count, pending invitations, workspace allocations, and enterprise seat capacity.
2. **`team-02-member-directory-desktop.png` / `-mobile.png`**:
   - Comprehensive member directory table with initials avatar, full name, email, organization role pill, status badge, workspace tags, and action buttons.
3. **`team-03-search-filter-sort-desktop.png` / `-mobile.png`**:
   - Interactive search toolbar with instant client/server filtering across member names, emails, role facets, and account statuses.
4. **`team-04-invite-member-modal-desktop.png` / `-mobile.png`**:
   - Invitation initiation modal with RFC-5322 email validation, organization role selection, and security notices.
5. **`team-05-invitation-form-desktop.png` / `-mobile.png`**:
   - Granular workspace assignment selector enabling immediate multi-workspace provisioning upon invitation acceptance.
6. **`team-06-pending-invitations-desktop.png` / `-mobile.png`**:
   - Pending invitation directory tracking awaiting candidates, token lifetime countdown, inviter attribution, and fast-action resend/cancel controls.
7. **`team-07-invitation-details-desktop.png` / `-mobile.png`**:
   - Cryptographic invitation verification modal displaying token hash integrity, expiration timeline, and creation metadata.
8. **`team-08-invitation-acceptance-desktop.png` / `-mobile.png`**:
   - Dedicated public onboarding portal allowing invited users to securely accept tenant membership and claim assigned workspace privileges.
9. **`team-09-invitation-expired-desktop.png` / `-mobile.png`**:
   - Graceful error state for expired, revoked, or non-existent invitation tokens with clear administrative contact guidance.
10. **`team-10-member-profile-details-desktop.png` / `-mobile.png`**:
    - Slide-out member dossier highlighting tenant tenure, 2FA enforcement status, active session counts, and role assignments.
11. **`team-11-member-role-permissions-desktop.png` / `-mobile.png`**:
    - Live RBAC inspection pane displaying effective granular permissions (`org:read`, `org:manage_members`, etc.) inherited from assigned roles.
12. **`team-12-workspace-memberships-desktop.png` / `-mobile.png`**:
    - Multi-tenant workspace access manager allowing administrators to grant, edit, or revoke workspace-scoped access.
13. **`team-13-member-access-status-desktop.png` / `-mobile.png`**:
    - Status lifecycle management interface supporting Active, Suspended, and Deactivated transition states.
14. **`team-14-deactivate-member-confirm-desktop.png` / `-mobile.png`**:
    - High-consequence confirmation modal explaining session invalidation while preserving historical audit and task records.
15. **`team-15-reactivate-member-desktop.png` / `-mobile.png`**:
    - Seamless member reinstatement flow restoring workspace access without requiring re-invitation.
16. **`team-16-remove-member-confirm-desktop.png` / `-mobile.png`**:
    - Strict deletion guard requiring explicit "REMOVE" text confirmation and enforcing the Last-Owner Protection invariant.
17. **`team-17-invitation-cancellation-desktop.png` / `-mobile.png`**:
    - Prompt confirmation dialog for revoking pending invitation tokens.
18. **`team-18-invitation-resend-desktop.png` / `-mobile.png`**:
    - Token refreshment and email re-dispatch workflow resetting token expiration to 7 days.
19. **`team-19-empty-team-state-desktop.png` / `-mobile.png`**:
    - Honest, professional empty state when an organization contains zero members beyond its owner, complete with an "+ Invite First Member" call to action.
20. **`team-20-team-states-desktop.png` / `-mobile.png`**:
    - UX states covering skeleton loading progress, inline validation alerts, and 403 Forbidden permission blocks.
21. **`team-21-team-audit-history-desktop.png` / `-mobile.png`**:
    - Immutable audit trail capturing timestamp, actor identity, action type (`INVITATION_CREATED`, `MEMBER_ROLE_CHANGED`, etc.), and change metadata.

---

## 4. Architectural Invariants
1. **Zero Dummy Records**:
   - All directory entries and pending invitations derive strictly from live MongoDB collections (`OrganisationMembership`, `Invitation`, `WorkspaceMembership`, `User`).
2. **Tenant Isolation**:
   - All team queries enforce `organisationId` matching the active authenticated organization context. Cross-tenant access is rejected with HTTP 403.
3. **Cryptographic Invitation Tokens**:
   - Raw tokens are generated via `crypto.randomBytes(32).toString('hex')`.
   - Only `crypto.createHash('sha256').update(token).digest('hex')` is stored in the database.
   - Raw tokens are never returned in JSON API responses or stored in log files.
4. **Last-Owner Protection**:
   - The organization owner cannot be deactivated, demoted, or removed without transferring ownership first.
5. **Session Invalidation on Deactivation**:
   - Deactivating a member flags the membership as suspended/deactivated and terminates active sessions.

