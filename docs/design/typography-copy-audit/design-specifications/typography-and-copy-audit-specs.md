# WORKZEN — Comprehensive Typography, Copywriting & Visual Audit Specification

## 1. Executive Summary

This specification documents the complete website and application content audit, copywriting overhaul, and typography standardization for **WORKZEN** — an enterprise project management and team collaboration SaaS platform.

All internal development language, phase references, technical framework identifiers, demo artifacts, and mock claims have been purged. The entire user-facing surface has been standardized on **Inter** typography, human-centric enterprise copy, and verified production API integration.

---

## 2. Global Typography Specification

### 2.1 Font Family Tokens
- **Primary Body & Display:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Monospace & Code:** `'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### 2.2 Typographic Hierarchy Scale

| Style / Token | Font Size | Weight | Line Height | Letter Spacing | Purpose & Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Heading** (`.wz-display-heading`) | 2.5rem (40px) | 800 (Bold) | 1.15 | -0.025em | Landing hero titles, brand headlines |
| **Page Heading** (`.wz-page-heading`) | 1.75rem (28px) | 700 (Bold) | 1.25 | -0.02em | Top-level view titles (Executive Dashboard, Team Hub) |
| **Section Heading** (`.wz-section-heading`) | 1.25rem (20px) | 600 (Semibold)| 1.35 | -0.01em | Card headers, table section titles |
| **Card Heading** (`.wz-card-heading`) | 1.05rem (16.8px)| 600 (Semibold)| 1.4 | normal | Sub-widgets, modal headers, item titles |
| **Body Regular** (`.wz-body`) | 0.9375rem (15px)| 400 (Regular) | 1.55 | normal | Primary prose, paragraph content |
| **Description / Muted** (`.wz-description`)| 0.875rem (14px) | 400 (Regular) | 1.5 | normal | Form helper copy, card subtexts |
| **Form Label** (`.wz-label`) | 0.8125rem (13px)| 600 (Semibold)| 1.3 | +0.01em | Input field labels, table headers |
| **Button Text** (`.wz-btn-text`) | 0.875rem (14px) | 600 (Semibold)| 1.2 | +0.01em | Primary, secondary, and ghost CTAs |
| **Navigation Item** (`.wz-nav-item`) | 0.875rem (14px) | 500 (Medium)  | 1.3 | normal | Sidebar links, header tabs, breadcrumbs |
| **Caption / Badge** (`.wz-caption`) | 0.75rem (12px)  | 600 (Semibold)| 1.2 | +0.02em | Status badges, timestamps, metadata chips |

---

## 3. Approved vs. Prohibited Copywriting Matrix

| Category | Prohibited / Purged Term | Approved Enterprise Standard | Architectural Reason |
| :--- | :--- | :--- | :--- |
| **Internal Development** | "Phase 1" through "Phase 9" | *Omitted entirely* or described by capability | Internal engineering milestones must never be visible to customers. |
| **Architecture / Tenancy** | "Tenant", "Multi-tenant", "Tenant space" | "Organization", "Organization Workspace" | Enterprise customers think in organizations and teams, not database tenancy models. |
| **Security / Auth** | "Bank-Grade JWT", "JWT Rotation Active" | "Secure Session Active", "Protected Access" | Avoid security theatre; state factual capabilities clearly. |
| **Network & Protocols** | "Socket.IO Broadcasting", "Socket connection" | "Real-time sync", "Instant updates" | Users care about collaborative speed, not WebSocket transport libraries. |
| **File Storage** | "Cloudinary Asset Management" | "Secure document attachments", "Cloud file storage" | Vendor implementation detail hidden behind product feature branding. |
| **Fabricated Metrics** | "10,000+ teams", "99.99% uptime guarantee" | Transparent factual capabilities | Eliminate deceptive marketing and unverified SLAs. |
| **Navigation** | "Sign In Portal" | "Sign In" | Clear, concise natural English. |
| **Prototypes** | "Prototype Navigator", "Dev Setup Prototype" | Removed / Standardized to "System Telemetry" | Remove test scaffolding from public customer views. |

---

## 4. Visual Prototype & Screenshot Matrix

High-fidelity desktop (1920×1080) and mobile (800×1200) visual prototypes and screenshots have been generated in:
- `docs/design/typography-copy-audit/prototypes/`
- `docs/design/typography-copy-audit/screenshots/`

| Surface / View | Desktop File | Mobile File | Key Typography & Copy Enhancements |
| :--- | :--- | :--- | :--- |
| **1. Typography System Spec** | `audit-01-typography-system-spec-desktop.png` | `audit-01-typography-system-spec-mobile.png` | Complete Inter typography scale, weights, hierarchy, and tokens. |
| **2. Landing Page Hero** | `audit-02-landing-page-hero-desktop.png` | `audit-02-landing-page-hero-mobile.png` | Value proposition with zero developer jargon or fake metrics. |
| **3. Authentication (Login)** | `audit-03-auth-login-desktop.png` | `audit-03-auth-login-mobile.png` | Single-sign on flow with natural labels and security clarity. |
| **4. Authentication (Register)** | `audit-04-auth-register-desktop.png` | `audit-04-auth-register-mobile.png` | Clear onboarding fields and workspace initialization. |
| **5. Team Management** | `audit-05-team-management-desktop.png` | `audit-05-team-management-mobile.png` | Role descriptions, real membership lists, invitation management. |
| **6. Roles & Permissions** | `audit-06-roles-permissions-desktop.png` | `audit-06-roles-permissions-mobile.png` | Governance matrix, granular permission sets, audit logs. |
| **7. Executive Dashboard** | `audit-07-executive-dashboard-desktop.png` | `audit-07-executive-dashboard-mobile.png` | Portfolio overview, sprint velocity telemetry, and team activity. |

---

## 5. Verification Status

- **Typecheck (`tsc --noEmit`):** Passed (0 errors).
- **Client Production Build (`npm run build:client`):** Passed (0 errors, Inter CSS bundle + Vite minification).
- **Server Production Build (`npm run build:server`):** Passed (0 errors).
- **Automated Test Suite (`npm test`):** 76 passed, 0 failed across all 11 suites.

