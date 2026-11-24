# WORKZEN

> **Plan Smarter. Work Together. Achieve More.**

[![Workzen CI](https://github.com/workzen/workzen/actions/workflows/ci.yml/badge.svg)](https://github.com/workzen/workzen/actions)
[![License: Proprietary Enterprise SaaS](https://img.shields.io/badge/License-Proprietary-indigo.svg)](#)
[![TypeScript: 5.7](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](#)
[![React: 18.3](https://img.shields.io/badge/React-18.3-61dafb.svg)](#)
[![Node: 20+](https://img.shields.io/badge/Node-20%2B-green.svg)](#)

WORKZEN is an enterprise-grade project management and team collaboration SaaS platform built for organizations, engineering divisions, and fast-moving startups. It delivers a modern workspace comparable in depth and quality to ClickUp, Asana, Monday.com, and Trello, while offering a specialized architecture built around strict multi-tenant isolation, real-time Socket.IO collaboration, and dual Stripe/Paystack payment integration.

---

## Official Technology Stack

- **Frontend:** React 18, TypeScript, Vite 6, Material UI (MUI v6), Bootstrap 5.3, React-Bootstrap, Zustand, TanStack Query v5, Zod.
- **Backend:** Node.js, Express.js, TypeScript.
- **Database:** MongoDB, Mongoose ODM (23 entity models with compound tenant indexes).
- **Authentication:** Stateless Dual JWT (15m Access Token, 7d Rotating Refresh Token), Bcrypt (12 salt rounds), 6-Digit Cryptographic OTP Verification.
- **Real-Time Engine:** Socket.IO with tenant and project room isolation.
- **File Storage:** Cloudinary with signed upload presets and MIME validation.
- **Payment & Subscriptions:** Stripe & Paystack automated webhook reconciliation.
- **DevOps & Containers:** Docker, Docker Compose, GitHub Actions CI.
- **Strict Architecture Rule:** Zero Next.js, zero Tailwind CSS, zero Redux. Unified full-stack repository with a single root `package.json`.

---

## Architectural Documentation Catalog

Exhaustive technical documentation authored in the `/docs` directory:

1. **[01. Project Assessment & Root-Cause Analysis](docs/01-project-assessment.md)**: 14-point forensic project assessment, verified vs. assumed findings, and architectural remediations.
2. **[02. Complete System & Repository Architecture](docs/02-system-architecture.md)**: Full-stack modular monolith, layered backend architecture, frontend layout system, and API standards.
3. **[03. Database & Multi-Tenant SaaS Architecture](docs/03-database-and-multitenancy.md)**: Catalog of all 23 database collections, field schemas, indexing plans, and tenant isolation enforcement.
4. **[04. Authentication, Authorization & Security Architecture](docs/04-auth-and-security.md)**: Dual JWT tokens, OTP verification, RBAC/PBAC matrix, rate limiting, and OWASP compliance.
5. **[05. Comprehensive Architecture Diagrams](docs/05-architecture-diagrams.md)**: 9 comprehensive Mermaid diagrams covering system topologies, sequence flows, ERDs, and Socket.IO gateways.
6. **[06. Phase 1 Implementation & Technical Foundation Report](docs/06-phase1-completion-report.md)**: Full milestone sign-off and Phase 1 completion report.

---

## Phase 1 High-Fidelity UI/UX Prototype (13 Enterprise Screens)

The project includes an interactive prototype showcasing the entire enterprise surface:

1. **Public Marketing Portal (`/`):** Hero section, value proposition, feature matrices, enterprise social proof, pricing tiers.
2. **Sign In Portal (`/login`):** Enterprise credentials authentication with simulated 2FA / 6-digit OTP verification.
3. **Register Organisation (`/register`):** Multi-tenant company onboarding, admin account setup, and initial workspace allocation.
4. **Enterprise Executive Dashboard:** Multi-organization health telemetry, sprint velocities, and portfolio health indicators.
5. **Organisation Hub:** Department allocations, workspace directories, and licensed seat utilization.
6. **Workspace Overview:** Team sprint velocity, recent activity streams, and quick action shortcuts.
7. **Project Portfolio & Roadmap:** Project health, milestone progress, burn-down summary, and team assignees.
8. **Kanban Workflow Board:** Interactive multi-column board (Backlog, To Do, In Progress, Review, Done) with priority indicators, subtask meters, tags, and status changers.
9. **Task Deep Dive & Activity:** Rich task view with subtasks checklist, activity log, threaded comments, and time tracking.
10. **Team Directory & Permissions:** Member directory, role assignments (Owner, Admin, Manager, Member, Guest), and invitation modal.
11. **Notification Centre:** Filterable real-time alert feed (All, Mentions, Tasks, System) with mark-as-read controls.
12. **Sprint Calendar & Deadlines:** Monthly deliverable schedule and task deadline milestones.
13. **Settings, Billing & Audit:** Organisation profile, 2FA security policies, active sessions, Stripe/Paystack subscription plans, and immutable audit logs.

---

## Repository Structure

```
workzen/
├── .github/workflows/ci.yml       # Centralized GitHub Actions CI
├── docs/                          # Comprehensive architectural specifications
├── src/
│   ├── shared/                    # Shared contracts, types, constants, validation
│   ├── server/                    # Node.js + Express + TypeScript Backend
│   └── client/                    # React 18 + Vite + MUI + Bootstrap Frontend
├── docker-compose.yml             # Local Multi-Container Environment (App + DB)
├── Dockerfile                     # Multi-stage production build
├── package.json                   # Single root package manifest
├── tsconfig.json                  # Shared & client TypeScript config
├── tsconfig.server.json           # Backend TypeScript build config
└── vite.config.ts                 # Vite bundler & reverse proxy config
```

---

## Local Development Quickstart

### 1. Prerequisites
- Node.js 20+ (tested on v24.11.1)
- npm 10+ (tested on v11.8.0)
- MongoDB instance (local or MongoDB Atlas)

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Servers
```bash
# Start frontend Vite client (runs on http://localhost:3070)
npm run dev

# Start backend Express & Socket.IO server (runs on http://localhost:5050)
npm run dev:server

# Run both concurrently
npm run dev:all
```

### 5. Build for Production
```bash
# Build frontend and backend bundles
npm run build
```

