# WORKZEN — Central Product Terminology & Copywriting Guide

## 1. Brand Identity & Voice Principles

WORKZEN is an enterprise-grade project management and team collaboration SaaS platform built for individuals, growing squads, and multi-tenant enterprise organizations.

### Voice & Tone Guidelines:
- **Professional, natural, international business English:** Write for business founders, project managers, engineers, and executive stakeholders.
- **Clarity over cleverness:** Explain what a feature accomplishes and why it matters in direct, unambiguous language.
- **Confident & Trustworthy:** Speak with calm authority. Avoid hype, exaggerated superlatives, or AI clichés ("elevate your journey", "supercharge your velocity", "revolutionary paradigm").
- **Action-Oriented:** Every button and call to action must describe the direct, real outcome ("Invite Team Member", "Save Changes", "Create Workspace").
- **Product Truth:** Never promise unbuilt features, fictitious uptime ("99.999% SLA" when uncertified), fabricated customer reviews, or fake statistics.

---

## 2. Approved vs. Banned Terminology Matrix

| Concept | Approved Term | Strictly Prohibited Terms | Usage Context |
|---|---|---|---|
| **Top-level Company Account** | **Organization** | *Tenant, Company Entity, Realm, Organization Account Instance* | Use "Organization" across all settings, onboarding, and invitations. |
| **Departmental Partition** | **Workspace** | *Silo, Sub-organization, Bucket, Sandbox, Sub-tenant* | Workspaces live within organizations and house projects/tasks. |
| **User in Organization** | **Team Member** | *User record, Squad member (in UI tables), Resource, Account seat* | Use "Team Member" in tables, directory, and invites. |
| **Work Container** | **Project** | *Epic, Initiative, Workstream, Bucket* | Houses Kanban boards and task lists. |
| **Deliverable Item** | **Task & Subtask** | *Ticket, Issue, Work item, Job* | Standard unit of deliverable work. |
| **Security Authority** | **Role & Permission** | *Privilege, Access token, Right, RBAC policy* | Roles define permissions for members. |
| **Onboarding Request** | **Invitation** | *Token link, Onboarding request, Crypto ticket* | Sent via email to bring new members into an organization. |
| **Security Notice** | **Data Isolation** | *Bank-grade JWT, IDOR-safe, SOC2 certified (unless certified)* | Describe security honestly as multi-tenant data boundaries. |
| **Real-Time Updates** | **Real-Time Collaboration** | *Socket.IO gateway, WebSockets pipe, Polling bus* | Describe user experience, not underlying JS libraries. |
| **Storage** | **Secure File Storage** | *Cloudinary bucket, S3 asset store, CDN dump* | Never expose third-party vendor names to customers. |

---

## 3. Standard Action Button Taxonomy

Action buttons must follow standard verb + noun phrasing:

- ✅ **Create Organization** (not "Setup New Tenant")
- ✅ **Create Workspace** (not "Add New Partition")
- ✅ **Invite Team Member** (not "Dispatch Invitation Token")
- ✅ **Save Changes** (not "Persist Modifications")
- ✅ **Update Role** (not "Mutate Role Assignment")
- ✅ **Manage Access** (not "Configure Permissions")
- ✅ **Remove Member** (not "Purge User")
- ✅ **Deactivate Member** (not "Suspend Tenant Record")
- ✅ **Cancel Invitation** (not "Revoke Token")
- ✅ **Resend Invitation** (not "Refresh Crypto Token")
- ✅ **Sign In** (not "Sign In Portal" or "Authenticate")
- ✅ **Sign Out** (not "Invalidate Session")

---

## 4. Typography Standards (Inter SaaS Font System)

Workzen standardizes on the **Inter** font family across the public marketing website and authenticated application:

- **Primary Font Family:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Monospace Family (for IDs & Code):** `'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace`

### Typography Hierarchy:
1. **Display Headings (`.wz-display-heading`):**
   - Font Size: `clamp(2rem, 4vw, 3rem)`
   - Weight: `700` (Bold)
   - Line Height: `1.15`
   - Letter Spacing: `-0.03em`
   - Application: Hero headlines, landing marketing headers.
2. **Page Headings (`.wz-page-heading`):**
   - Font Size: `1.5rem` (24px)
   - Weight: `700`
   - Line Height: `1.25`
   - Letter Spacing: `-0.02em`
   - Application: Main dashboard views, settings page titles.
3. **Section Headings (`.wz-section-heading`):**
   - Font Size: `1.25rem` (20px)
   - Weight: `600` (Semi-bold)
   - Line Height: `1.35`
   - Letter Spacing: `-0.015em`
   - Application: Modal titles, table section titles.
4. **Card Headings (`.wz-card-heading`):**
   - Font Size: `1.05rem` (16.8px)
   - Weight: `600`
   - Line Height: `1.4`
   - Letter Spacing: `-0.01em`
   - Application: Metric cards, panel titles.
5. **Body Text (`.wz-body`):**
   - Font Size: `0.925rem` (14.8px)
   - Weight: `400` (Regular)
   - Line Height: `1.55`
   - Color: `--wz-slate-700` (`#334155`)
   - Application: General descriptions, dialog bodies, help text.
6. **Form Labels & Instructions (`.wz-label`, `.wz-form-text`):**
   - Label: `0.8125rem` (13px), Weight: `600`, Color: `#334155`
   - Instruction: `0.775rem` (12.4px), Weight: `400`, Color: `#64748B`
7. **Table Headers & Cells (`.wz-table-head`, `.wz-table-cell`):**
   - Head: `0.75rem` (12px), Weight: `600`, Uppercase, Letter Spacing: `0.05em`
   - Cell: `0.875rem` (14px), Weight: `400`, Color: `#1E293B`

---

## 5. Elimination of Internal Engineering Language

The following internal terms must never be presented in customer-facing interfaces:

- ❌ "Phase 1", "Phase 2", "Phase 4 Launch", "Phase 8 RBAC", "Phase 9 Team Management Active"
- ❌ "JWT Token Family Rotation Active"
- ❌ "Socket.IO Gateway Ready"
- ❌ "Cloudinary asset uploads"
- ❌ "Mongoose schema policies"
- ❌ "IDOR-safe"
- ❌ "Scheduled for next development phase"
- ❌ "Mock data" / "Demo credentials"
- ❌ "Live prototype"

Replace all occurrences with genuine user-facing descriptions of what the capability provides to the team.

