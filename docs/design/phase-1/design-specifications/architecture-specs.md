# WORKZEN — Phase 1: Complete Enterprise Architecture Visual Specifications
## Master Technical Blueprint & Architecture Catalog

---

## 1. Overview & Architectural Scope

This specification documents the complete product architecture for **WORKZEN**, an enterprise-grade project management and team collaboration SaaS platform. Designed to scale from single-user freelancers up to multi-thousand seat enterprise corporations, WORKZEN provides high performance, fault tolerance, strict tenant isolation, and cryptographic defense-in-depth.

All visual architecture blueprints have been generated as high-resolution deliverables and are permanently stored in `docs/design/phase-1/prototypes/` and `docs/design/phase-1/diagrams/`.

---

## 2. Visual Architecture Deliverables Catalog

| # | Visual Asset Filename | Architecture Domain | Resolution | Storage Paths |
|---|---|---|---|---|
| **01** | `arch-01-system-overview.png` | Complete System Topology | 1920 × 1080 | `docs/design/phase-1/prototypes/`<br/>`docs/design/phase-1/diagrams/` |
| **02** | `arch-02-frontend-backend.png` | Frontend & Backend Layer Pipeline | 1920 × 1080 | `docs/design/phase-1/prototypes/`<br/>`docs/design/phase-1/diagrams/` |
| **03** | `arch-03-database-relationships.png` | Document Model & Relationship Hierarchy | 1920 × 1080 | `docs/design/phase-1/prototypes/`<br/>`docs/design/phase-1/diagrams/` |
| **04** | `arch-04-multitenant-isolation.png` | Multi-Tenant Organization Boundary & IDOR Defense | 1920 × 1080 | `docs/design/phase-1/prototypes/`<br/>`docs/design/phase-1/diagrams/` |
| **05** | `arch-05-authentication-lifecycle.png` | Authentication & Token Lifecycle | 1920 × 1080 | `docs/design/phase-1/prototypes/`<br/>`docs/design/phase-1/diagrams/` |
| **06** | `arch-06-api-pipeline.png` | API Gateway & Middleware Pipeline | 1920 × 1080 | `docs/design/phase-1/prototypes/`<br/>`docs/design/phase-1/diagrams/` |
| **07** | `arch-07-realtime-events.png` | Real-Time WebSocket Event Topology | 1920 × 1080 | `docs/design/phase-1/prototypes/`<br/>`docs/design/phase-1/diagrams/` |
| **08** | `arch-08-storage-cdn.png` | File Storage & Asset CDN Architecture | 1920 × 1080 | `docs/design/phase-1/prototypes/`<br/>`docs/design/phase-1/diagrams/` |
| **09** | `arch-09-billing-quotas.png` | Subscription Tiers, Billing & Quotas | 1920 × 1080 | `docs/design/phase-1/prototypes/`<br/>`docs/design/phase-1/diagrams/` |
| **10** | `arch-10-security-defense.png` | Enterprise Security & Defense-in-Depth | 1920 × 1080 | `docs/design/phase-1/prototypes/`<br/>`docs/design/phase-1/diagrams/` |

---

## 3. Detailed Architectural Principles

### 3.1 Logical Multi-Tenancy
WORKZEN utilizes a shared-database, logical-isolation architecture. Every tenant document (Organisation, Workspace, Project, Task) is indexed by `orgId`. Access to any tenant resource requires cryptographically verifying caller identity via JWT, querying `OrganisationMember` for active membership, and checking role permissions before database execution.

### 3.2 Dual-Token Authentication Lifecycle
- **Access Token:** Short-lived (15 minutes), signed with `JWT_SECRET`, carried in `Authorization: Bearer <token>`.
- **Refresh Token:** Long-lived (7 days), signed with `JWT_REFRESH_SECRET`, stored in encrypted database session records, automatically rotated on every refresh.
- **OTP Verification:** 6-digit cryptographically random numeric code with 15-minute validity window for email verification and password reset.

### 3.3 Strict Schema Validation
All inbound requests are validated against immutable Zod schemas before touching service or controller logic. Payloads containing unexpected keys or invalid data types are rejected immediately with descriptive 400 Bad Request error envelopes.

