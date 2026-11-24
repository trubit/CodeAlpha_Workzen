# WORKZEN — Phase 7: Workspace Management Visual Design Specifications
## Master Design Specifications & Component Catalog

---

## 1. Overview & Visual Benchmarks

Phase 7 establishes the **Workspace Management System** for **WORKZEN**.
A workspace is the primary functional environment within an organization where teams build projects, execute sprint tasks, and track productivity.

### Visual Benchmarks:
- **Linear-Inspired Hierarchy:** Dark slate canvases (`#0B0C10`, `#171822`, `#272A3B`) with issue hierarchies, tag chips, and area progress burndowns.
- **TaskFlow Light Telemetry:** Clean pearl slate canvases (`#F8FAFC`, `#FFFFFF`, `#F1F5F9`) with pastel-tinted stat tiles and metric indicators.
- **B2B Popover Switcher:** Dropdown workspace selector with search, active amber-gold gradient highlight, and "Current" pill.

---

## 2. Deliverables Catalog (30 Prototypes + 7 Diagrams)

### Prototypes (`docs/design/phase-7/prototypes/`):

| # | Prototype File | Viewport | Screen Purpose |
|---|---|---|---|
| **01** | `ws-01-create-desktop.png` | 1920 × 1080 | Workspace Creation Modal & Color Picker |
| **02** | `ws-01-create-mobile.png` | 800 × 1200 | Mobile Workspace Creation Form |
| **03** | `ws-02-onboarding-desktop.png` | 1920 × 1080 | Workspace Template Selection Onboarding |
| **04** | `ws-02-onboarding-mobile.png` | 800 × 1200 | Mobile Template Onboarding |
| **05** | `ws-03-select-grid-desktop.png` | 1920 × 1080 | Workspace Directory & Selection Grid |
| **06** | `ws-03-select-grid-mobile.png` | 800 × 1200 | Mobile Workspace Directory Cards |
| **07** | `ws-04-switcher-popover-desktop.png` | 1920 × 1080 | B2B Popover Switcher with Gradient Active Pill |
| **08** | `ws-04-switcher-popover-mobile.png` | 800 × 1200 | Mobile Workspace Switcher Sheet |
| **09** | `ws-05-overview-desktop.png` | 1920 × 1080 | Workspace Overview Dashboard & Telemetry |
| **10** | `ws-05-overview-mobile.png` | 800 × 1200 | Mobile Workspace Overview |
| **11** | `ws-06-profile-desktop.png` | 1920 × 1080 | Workspace Profile, Name, Icon & Theme Color |
| **12** | `ws-06-profile-mobile.png` | 800 × 1200 | Mobile Workspace Profile |
| **13** | `ws-07-settings-desktop.png` | 1920 × 1080 | Workspace Operational Policies & Defaults |
| **14** | `ws-07-settings-mobile.png` | 800 × 1200 | Mobile Workspace Settings |
| **15** | `ws-08-branding-desktop.png` | 1920 × 1080 | Workspace Custom Branding & Theming |
| **16** | `ws-08-branding-mobile.png` | 800 × 1200 | Mobile Workspace Branding |
| **17** | `ws-09-details-meta-desktop.png` | 1920 × 1080 | Parent Tenancy, Slug & Metadata |
| **18** | `ws-09-details-meta-mobile.png` | 800 × 1200 | Mobile Workspace Metadata |
| **19** | `ws-10-archive-confirm-desktop.png` | 1920 × 1080 | Safe Archival Dialog Requiring Exact Name |
| **20** | `ws-10-archive-confirm-mobile.png` | 800 × 1200 | Mobile Archive Confirmation |
| **21** | `ws-11-deletion-confirm-desktop.png` | 1920 × 1080 | Data Retention Protection & Deletion Guard |
| **22** | `ws-11-deletion-confirm-mobile.png` | 800 × 1200 | Mobile Deletion Confirmation |
| **23** | `ws-12-empty-state-desktop.png` | 1920 × 1080 | Workspace Empty State & Project CTA |
| **24** | `ws-12-empty-state-mobile.png` | 800 × 1200 | Mobile Empty State |
| **25** | `ws-13-loading-state-desktop.png` | 1920 × 1080 | Workspace Skeleton & Shimmer Loaders |
| **26** | `ws-13-loading-state-mobile.png` | 800 × 1200 | Mobile Loading Skeleton |
| **27** | `ws-14-error-state-desktop.png` | 1920 × 1080 | Workspace Telemetry Error Alert |
| **28** | `ws-14-error-state-mobile.png` | 800 × 1200 | Mobile Error Alert |
| **29** | `ws-15-access-denied-desktop.png` | 1920 × 1080 | 403 Forbidden Access Denied (Anti-IDOR) |
| **30** | `ws-15-access-denied-mobile.png` | 800 × 1200 | Mobile 403 Access Denied |

### Architecture Diagrams (`docs/design/phase-7/diagrams/`):
1. `ws-diag-01-1.png`: Complete Workspace Architecture Topology
2. `ws-diag-02-2.png`: Organization-to-Workspace Tenancy Boundary
3. `ws-diag-03-3.png`: Workspace Creation & Slug Generation Flow
4. `ws-diag-04-4.png`: Workspace Selection & Context Switching Workflow
5. `ws-diag-05-5.png`: Multi-Tenant Authorization & Anti-IDOR Defense
6. `ws-diag-06-6.png`: Workspace Archival & Recovery Lifecycle
7. `ws-diag-07-7.png`: Database Schema & Compound Index Architecture

