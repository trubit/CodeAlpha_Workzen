# WORKZEN — Phase 6 Project Scan & Implementation Assessment
## Complete Organization Management System

> **Date:** November 2026  
> **Status:** Phase 6 Architecture & Assessment  
> **Target Audience:** Engineering, Product, Security Architecture  
> **Product Identity:** WORKZEN ("Plan Smarter. Work Together. Achieve More.")

---

## 1. Executive Summary & Repository Inspection

Phase 5 (Secure Authentication System) was completed with:
- Production-grade authentication with real MongoDB persistence, bcrypt hashing, JWT access tokens, and rotating refresh tokens with reuse detection.
- 23/23 passing automated tests.
- 0 TypeScript compilation errors.
- Verified visual parity across desktop, tablet, and mobile auth prototypes.

### Existing Architecture & Assets Reused:
1. **User Identity & Auth:** `UserModel`, `SessionModel`, `AuthService`, `authenticate` middleware in `src/server/middleware/auth.ts`.
2. **Design System & Tokens:** MUI + Bootstrap + React-Bootstrap with Workzen tokens (`colors.ts`, `spacing.ts`, `typography.ts`).
3. **State Management:** Zustand `useWorkzenStore.ts` tracking `currentUser`, `authToken`, `organisations`, `currentOrg`.
4. **Validation:** Shared Zod schemas (`src/shared/validation/`).
5. **Database Foundations:** `OrganisationModel` in `src/server/models/Organisation.ts` and `OrganisationMembershipModel` in `src/server/models/OrganisationMembership.ts`.

---

## 2. Root-Cause & Implementation Assessment

### Discrepancies & Enhancements Identified:
1. **Organisation Schema Alignment:**
   - Existing `OrganisationModel` lacked explicit fields required by Phase 6: `description`, `industry`, `organizationSize`, `website`, `country`, `timezone`, `status` (`'active' | 'archived'`), `archivedAt`, and explicit deletion tracking.
   - We must enhance `OrganisationModel` to support these enterprise attributes safely without breaking backward compatibility.

2. **Multi-Tenant Isolation Middleware:**
   - Existing `src/server/middleware/tenant.ts` only checked headers without verifying whether the authenticated user is actually an active member of that organisation in MongoDB.
   - **Critical Security Control:** We must implement strict authorization middleware:
     - `requireOrgMember`: Verifies `OrganisationMembershipModel` contains an active record for `(req.user.userId, targetOrgId)` in the database before granting tenant access.
     - `requireOrgOwner`: Ensures only the organization's owner (`ownerId === req.user.userId`) can perform destructive actions (branding, settings, deletion, ownership transfer).
     - Protects against Insecure Direct Object References (IDOR) and cross-tenant data leakage.

3. **Unique Slug Generation & Collision Avoidance:**
   - Slugs derived from organization names must be normalized (lowercase alphanumeric with hyphens) and guaranteed unique. If `acme` exists, subsequent creations automatically append `-1`, `-2`, etc.

4. **Ownership Transfer & Safe Deletion Workflow:**
   - Owner transfer must verify the target recipient is an active member of the organization, update `Organisation.ownerId`, and record the change in `AuditLog`.
   - Organization deletion must require typing the exact organization name, verify caller is owner, perform safe archival/soft-deletion (`status: 'archived'`), and revoke active tenant sessions.

5. **Frontend State & Cache Invalidation:**
   - In `useWorkzenStore.ts`, switching `currentOrg` must invalidate or reset organization-scoped cached data so previous tenant records cannot leak into the new context.

---

## 3. Strict Phase Boundaries

- **Phase 6 Scope:** Complete Organization Management (Creation, onboarding, selection, overview dashboard, profile, settings, branding, ownership info & transfer, soft deletion, multi-tenant isolation middleware).
- **Out of Scope (Deferred to Later Phases):**
  - Phase 7: Complete Workspace Management (isolated operational divisions within an organization).
  - Phase 8: Complete Enterprise RBAC (custom roles, permission matrices).
  - Phase 9: Complete Team Management & Invitations.

---

## 4. Execution Roadmap

1. **Visual Prototypes (Google Stitch / Vector Alternative):** Generate 24 prototype pictures for all desktop, tablet, and mobile screens in `docs/design/phase-6/prototypes/`.
2. **Design Specifications & Diagrams:** Document specs and 7 Mermaid diagrams in `docs/design/phase-6/`.
3. **Database & Backend Models:** Enhance `OrganisationModel` and `OrganisationMembershipModel` with indexes and safe validation.
4. **Backend Services & Routes:** Implement `orgService.ts`, `orgController.ts`, `tenant.ts` (with `requireOrgMember` & `requireOrgOwner`), and mount on `/api/v1/organizations`.
5. **Frontend UI Components:** Build `OrganisationCreateModal`, `OrganisationSelector`, `OrganisationOnboardingPage`, `OrganisationDashboard`, `OrganisationSettingsPage`, `DeleteOrgModal`, `TransferOwnershipModal`.
6. **Automated Tests:** Comprehensive integration suite in `tests/organization.test.ts` covering creation, slug collisions, member access, IDOR prevention, owner restrictions, updates, transfer, and archival.
7. **Screenshots & Comparison Report:** Capture live screenshots and evaluate parity with prototypes.
8. **Build & Quality Audit:** Run `typecheck`, `test`, `build`, and code review.

