# WORKZEN — Phase 3 Design System Architecture Diagrams

This document contains the official architecture and workflow diagrams for Phase 3 of WORKZEN, modeling the design system tokens, component hierarchies, responsive navigation, and prototype workflows.

---

## Diagram 1: Design System Architecture

```mermaid
flowchart TD
    subgraph Tokens["Design Tokens Layer"]
        C[Colors Palette]
        T[Typography Scale]
        S[Spacing, Radii & Shadows]
        Z[Z-Index & Transitions]
    end

    subgraph Primitives["Primitive UI Components Layer"]
        BTN[Button]
        INP[Input]
        CRD[Card]
        BDG[Badge]
        PB[ProgressBar]
    end

    subgraph DomainComponents["Domain UI Components Layer"]
        SC[StatCard]
        PBG[PriorityBadge]
        SP[StatusPill]
        MN[MobileNav]
    end

    subgraph Layouts["Layouts & View Canvas"]
        APP[AppLayout]
        SB[Sidebar]
        TB[TopHeader]
        PAGE[Screen Views: Dashboard, Kanban, Analytics, Settings]
    end

    Tokens --> Primitives
    Primitives --> DomainComponents
    DomainComponents --> PAGE
    Primitives --> Layouts
    Layouts --> PAGE
```

---

## Diagram 2: Theme and Token Structure

```mermaid
classDiagram
    class ColorTokens {
        +primary: Record~number, string~
        +secondary: Record~number, string~
        +neutral: Record~number, string~
        +success: Record~number, string~
        +warning: Record~number, string~
        +danger: Record~number, string~
        +background: Record~string, string~
        +text: Record~string, string~
    }

    class TypographyTokens {
        +fontFamily: string
        +fontSizes: Record~string, string~
        +fontWeights: Record~string, number~
        +lineHeights: Record~string, string~
    }

    class SpacingTokens {
        +spacing: Record~string, string~
        +radii: Record~string, string~
        +shadows: Record~string, string~
    }

    class WorkzenTheme {
        +mode: "light" | "dark"
        +colors: ColorTokens
        +typography: TypographyTokens
        +spacing: SpacingTokens
    }

    WorkzenTheme *-- ColorTokens
    WorkzenTheme *-- TypographyTokens
    WorkzenTheme *-- SpacingTokens
```

---

## Diagram 3: Reusable Component Hierarchy

```mermaid
graph TD
    Root[Design System Root]
    
    Root --> Atoms
    subgraph Atoms[Atomic Components]
        A1[Button - 6 variants, 3 sizes]
        A2[Input - search, password, error]
        A3[Badge - solid, subtle, count]
        A4[PriorityBadge - Urgent, High, Medium, Low]
        A5[StatusPill - Done, In Progress, Review, To Do]
    end

    Root --> Molecules
    subgraph Molecules[Molecular Components]
        M1[StatCard - metric, trend delta, icon]
        M2[ProgressBar - linear meter, SVG donut]
        M3[Card - elevated, outlined, hoverable]
    end

    Root --> Organisms
    subgraph Organisms[Organism Components & Layouts]
        O1[Sidebar Navigation]
        O2[Top Application Header]
        O3[MobileNav Bottom Bar]
        O4[Kanban Column & Task Card]
        O5[Analytics Wave & Donut Chart]
    end

    Atoms --> Molecules
    Molecules --> Organisms
```

---

## Diagram 4: Frontend Layout Architecture

```mermaid
flowchart LR
    subgraph DesktopLayout["Desktop Viewport (>= 992px)"]
        D_SIDE["Left Sidebar (260px)"]
        subgraph D_MAIN["Main Viewport"]
            D_TOP["Top Global Header (64px)"]
            D_BODY["Dynamic Page Canvas (Dashboard / Kanban / Analytics)"]
        end
        D_SIDE --- D_MAIN
        D_TOP --- D_BODY
    end

    subgraph MobileLayout["Mobile Viewport (< 768px)"]
        M_TOP["Compact Mobile Header (56px)"]
        M_BODY["Single Column Scrollable Canvas"]
        M_NAV["Fixed Bottom Navigation Bar (64px)"]
        M_TOP --- M_BODY
        M_BODY --- M_NAV
    end
```

---

## Diagram 5: Responsive Navigation Behaviour

```mermaid
stateDiagram-v2
    [*] --> DeviceDetection
    
    DeviceDetection --> DesktopMode : Viewport >= 992px
    DeviceDetection --> TabletMode : 768px <= Viewport < 992px
    DeviceDetection --> MobileMode : Viewport < 768px

    state DesktopMode {
        ExpandedSidebar --> ActivePage
        GlobalSearchBar --> SearchModal
        NotificationsBell --> NotificationDropdown
    }

    state TabletMode {
        CollapsedIconSidebar --> ActivePage
        DrawerTrigger --> SlideOutNavigation
    }

    state MobileMode {
        StickyMobileHeader --> ActivePage
        BottomNavBar --> TabSwitching
        QuickActionPlus --> TaskCreateModal
    }
```

---

## Diagram 6: UI Component Relationships & Data Flow

```mermaid
flowchart TD
    Store[(Zustand Global Store)] -->|activeTab, theme, user| AppLayout
    AppLayout --> Sidebar
    AppLayout --> TopHeader
    AppLayout --> MobileNav
    AppLayout --> ViewRouter{Active Tab}

    ViewRouter -->|'dashboard'| DashboardPage
    ViewRouter -->|'projects'| KanbanPage
    ViewRouter -->|'analytics'| ReportsAnalyticsPage
    ViewRouter -->|'settings'| SettingsPage

    DashboardPage --> StatCard
    DashboardPage --> ProgressBar
    DashboardPage --> StatusPill
    DashboardPage --> PriorityBadge

    KanbanPage --> Card
    KanbanPage --> PriorityBadge
    KanbanPage --> StatusPill
    KanbanPage --> Button

    ReportsAnalyticsPage --> StatCard
    ReportsAnalyticsPage --> ProgressBar
```

---

## Diagram 7: Prototype-to-Implementation Workflow

```mermaid
flowchart LR
    Step1["1. Design Research & Benchmark<br>(FlowTask, Scopeboard, Loqo, TaskGenius)"] --> Step2["2. Token System Definition<br>(Colors, Typography, Spacing in TypeScript)"]
    Step2 --> Step3["3. Reusable UI Components<br>(Button, Card, StatCard, Badges, Meters)"]
    Step3 --> Step4["4. Interactive Prototype Integration<br>(AppLayout, Sidebar, ReportsAnalyticsPage)"]
    Step4 --> Step5["5. Automated Screenshot Generation<br>(16 Desktop + 16 Mobile PNGs in docs/design/screenshots)"]
    Step5 --> Step6["6. Verification & Quality Gates<br>(Vitest, TypeScript Check, Vite Build)"]
    Step6 --> Step7["7. Phase 3 Approval & Sign-Off<br>(Production-Ready Foundation for Phase 4)"]
```

