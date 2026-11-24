# WORKZEN — Design System Specification

> **Package/Module:** `src/client/design-system/`  
> **Framework Base:** React 19, TypeScript, Material UI (MUI), Bootstrap / React-Bootstrap  
> **Architecture Principle:** Strict component encapsulation, zero Tailwind/Next.js/Redux dependencies, accessible semantic DOM, theme-aware tokens.

---

## 1. System Overview & Token Architecture

The Workzen Design System provides the single source of truth for all visual tokens and UI components across the client application. Located under `src/client/design-system/`, it exports:

```
src/client/design-system/
├── tokens/
│   ├── colors.ts          # Hex & RGBA palette for light/dark themes
│   ├── typography.ts      # Font families, sizes, line heights, font weights
│   ├── spacing.ts         # Spacing scale (4px to 64px), border radii, elevation shadows
│   └── index.ts           # Central token re-exporter
├── components/
│   ├── Button.tsx         # Unified enterprise button with 6 variants & loading states
│   ├── Card.tsx           # Elevated, outlined, and flat card containers
│   ├── StatCard.tsx       # KPI stat display with trend arrows & icon badges (Ref: FlowTask)
│   ├── Badge.tsx          # Pill/badge tags for counts, categories, and attributes
│   ├── PriorityBadge.tsx  # Task priority indicator (Urgent, High, Medium, Low)
│   ├── StatusPill.tsx     # Workflow status (Done, In Progress, Review, To Do, Backlog)
│   ├── ProgressBar.tsx    # Linear meters and circular progress donuts (Ref: TaskGenius)
│   ├── Input.tsx          # Form inputs with search icons, error text, and password toggles
│   └── index.ts           # Unified component exports
└── layouts/
    └── MobileNav.tsx      # Fixed bottom navigation bar for mobile viewports
```

---

## 2. Component Catalog & API Reference

### 2.1. Button (`Button.tsx`)
Enterprise action trigger with micro-interactions, focus rings, and spinners.

- **Variants:**
  - `primary`: Solid `#4F46E5` with `#FFFFFF` text. Main call to actions.
  - `secondary`: `#EEF2FF` background with `#4F46E5` text. Sub-actions.
  - `tertiary`: Bordered subtle `#E2E8F0` with `#334155` text. Clean neutral action.
  - `outline`: Transparent with colored border.
  - `ghost`: Transparent at rest, subtle `#F1F5F9` background on hover.
  - `danger`: Solid `#EF4444` for destructive actions (Delete, Remove).
- **Sizes:** `sm` ($28\text{px}$ height), `md` ($38\text{px}$ height), `lg` ($48\text{px}$ height).
- **Properties:** `isLoading`, `leftIcon`, `rightIcon`, `fullWidth`, `disabled`.

### 2.2. Card (`Card.tsx`)
Standardized elevated surface container with customizable padding and optional hover lift.

- **Variants:**
  - `elevated`: White surface with subtle `0 1px 3px rgba(0,0,0,0.05)` shadow.
  - `outlined`: White surface with `1px solid #E2E8F0` border and zero shadow.
  - `flat`: Soft `#F8FAFC` background.
- **Hoverable:** Adds `transform: translateY(-2px)` and shadow elevation on hover.

### 2.3. StatCard (`StatCard.tsx`)
Designed directly after the high-performing metrics cards in FlowTask (Image 1 reference).

- **Props:**
  - `label`: Metric category (e.g., "Total Tasks", "Completed", "In Progress").
  - `value`: Numerical or textual metric (e.g., "54", "31", "94%").
  - `delta`: Trend change string (e.g., "+6 this week", "+12%").
  - `trend`: `'up' | 'down' | 'neutral'`.
  - `icon`: Icon component or SVG node.
  - `iconColor` & `iconBg`: Customizable tint colors.

### 2.4. PriorityBadge (`PriorityBadge.tsx`)
Displays task urgency with soft tinted backgrounds and high-contrast text, matching the Scopeboard reference (Image 2).

- **Levels:**
  - `urgent`: Red background (`#FEF2F2`), Red text (`#DC2626`), Flame/Alert icon.
  - `high`: Orange background (`#FFF7ED`), Orange text (`#EA580C`), Chevron Up icon.
  - `medium`: Amber background (`#FFFBEB`), Amber text (`#D97706`), Equal/Bar icon.
  - `low`: Emerald background (`#ECFDF5`), Emerald text (`#059669`), Chevron Down icon.

### 2.5. StatusPill (`StatusPill.tsx`)
Workflow lifecycle tag with colored indicator dot.

- **States:**
  - `done`: Emerald dot & pill (`#ECFDF5` / `#059669`)
  - `in-progress`: Indigo dot & pill (`#EEF2FF` / `#4F46E5`)
  - `review`: Amber dot & pill (`#FFFBEB` / `#D97706`)
  - `to-do`: Slate dot & pill (`#F1F5F9` / `#475569`)
  - `backlog`: Cool gray dot & pill (`#F8FAFC` / `#64748B`)
  - `cancelled`: Rose dot & pill (`#FEF2F2` / `#E11D48`)

### 2.6. ProgressBar (`ProgressBar.tsx`)
Provides both linear enterprise meters and circular SVG progress rings (inspired by TaskGenius, Image 4).

- **Modes:**
  - `linear`: Rounded bar with configurable height, fill color, and animated transition.
  - `circular`: Precision SVG ring calculation:
    $$\text{circumference} = 2 \times \pi \times \text{radius}$$
    $$\text{offset} = \text{circumference} - \left(\frac{\text{value}}{100} \times \text{circumference}\right)$$
    Displays percentage centered inside the ring.

### 2.7. Input (`Input.tsx`)
Enterprise form input component supporting labels, helper text, error validation states, search leading icons, and password visibility reveal triggers.

---

## 3. Light & Dark Theme Strategy

Workzen utilizes CSS custom properties combined with TypeScript token definitions to ensure seamless light/dark mode adaptation without style recalculation lag.

- **Light Mode (Default):** High-clarity `#F8FAFC` background with `#FFFFFF` cards and `#0F172A` text.
- **Dark Mode:** Deep `#0B0F19` background with `#1E293B` cards, `#334155` borders, and `#F8FAFC` text.
- **Contrast Guarantee:** Both themes guarantee minimum $4.5:1$ contrast ratio for body text and $3:1$ for UI components and headers under WCAG 2.1 Level AA.

