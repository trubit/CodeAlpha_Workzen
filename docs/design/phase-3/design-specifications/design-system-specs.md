# WORKZEN — Phase 3: Master Visual Design System Specifications
## Design System & Component Library Catalog

---

## 1. Design Direction & Visual Benchmarks

WORKZEN's master design system balances high-efficiency technical capability with modern elegance. The design incorporates:
1. **Linear Dark Mode:** High-contrast slate/midnight canvases (`#0B0C10`, `#12131A`, `#171822`, `#272A3B`) with issue group indicators, custom priority flame badges, and interactive progress velocity curves.
2. **TaskFlow Light Mode:** Clean, airy pearl slate canvases (`#F8FAFC`, `#FFFFFF`, `#F1F5F9`, `#E2E8F0`) with pastel-tinted KPI stat cards (94.2%, 2.4h, 18.5, 87%), 6-month area charts, bar charts, category progress meters, quick insights, and multi-segment donut rings.
3. **Taskly Mobile App Experience:** Fluid mobile interfaces with rounded pill buttons, greeting headers, avatar stacks with active indicators, urgency badges, meeting cards, and floating black pill capsule bottom navigation bars.

---

## 2. Deliverables Catalog

| # | Visual Asset Filename | Viewport | Benchmark Inspiration | Storage Paths |
|---|---|---|---|---|
| **01** | `ds-01-main-desktop-dark.png` | 1920 × 1080 | Linear Darkmode Dashboard | `docs/design/phase-3/prototypes/`<br/>`docs/design/phase-3/screenshots/` |
| **02** | `ds-02-main-desktop-light.png` | 1920 × 1080 | TaskFlow Lightmode Performance Analytics | `docs/design/phase-3/prototypes/`<br/>`docs/design/phase-3/screenshots/` |
| **03** | `ds-03-main-mobile-app.png` | 800 × 1200 | Taskly Mobile Project App | `docs/design/phase-3/prototypes/`<br/>`docs/design/phase-3/screenshots/` |
| **04** | `ds-04-dashboard-components.png` | 1920 × 1080 | Modular KPI & Graph Suite | `docs/design/phase-3/prototypes/`<br/>`docs/design/phase-3/screenshots/` |
| **05** | `ds-05-project-cards-grid.png` | 1920 × 1080 | Project Cards & Completion Dials | `docs/design/phase-3/prototypes/`<br/>`docs/design/phase-3/screenshots/` |
| **06** | `ds-06-task-cards-badging.png` | 1920 × 1080 | Flame Urgent, High, Med, Low Tasks | `docs/design/phase-3/prototypes/`<br/>`docs/design/phase-3/screenshots/` |
| **07** | `ds-07-kanban-board-workflow.png` | 1920 × 1080 | Scopeboard Multi-Column Kanban | `docs/design/phase-3/prototypes/`<br/>`docs/design/phase-3/screenshots/` |
| **08** | `ds-08-calendar-schedule-suite.png` | 1920 × 1080 | Calendar Strip & Scrum Video Card | `docs/design/phase-3/prototypes/`<br/>`docs/design/phase-3/screenshots/` |
| **09** | `ds-09-forms-dialogs-modals.png` | 1920 × 1080 | Forms, Dialogs & Inline Validation | `docs/design/phase-3/prototypes/`<br/>`docs/design/phase-3/screenshots/` |
| **10** | `ds-10-settings-notifications-drawer.png` | 1920 × 1080 | User Settings & Slide-out Notifications | `docs/design/phase-3/prototypes/`<br/>`docs/design/phase-3/screenshots/` |

---

## 3. Core Color Tokens

```json
{
  "dark": {
    "canvas": "#0B0C10",
    "sidebar": "#12131A",
    "card": "#171822",
    "inner": "#1E202E",
    "border": "#272A3B",
    "borderHigh": "#3D4259"
  },
  "light": {
    "canvas": "#F8FAFC",
    "card": "#FFFFFF",
    "inner": "#F1F5F9",
    "border": "#E2E8F0"
  },
  "brand": {
    "primary": "#6366F1",
    "purple": "#8B5CF6",
    "emerald": "#10B981",
    "rose": "#F43F5E",
    "amber": "#F59E0B",
    "sky": "#0EA5E9"
  }
}
```

