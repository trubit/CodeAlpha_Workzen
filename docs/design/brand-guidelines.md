# WORKZEN — Brand Guidelines & Visual Identity System

> **Official Product Identity:** WORKZEN  
> **Tagline:** "Plan Smarter. Work Together. Achieve More."  
> **Category:** Enterprise Project Management and Team Collaboration SaaS  
> **Brand Archetype:** Modern, Precise, Empowering, Calming ("Zen" focus + high-performance enterprise execution)

---

## 1. Brand Philosophy & Positioning

WORKZEN addresses the modern enterprise dilemma: fragmented tools, cluttered workspaces, and operational cognitive overload. By fusing high-velocity project management with a clean, distraction-free aesthetic ("Work" + "Zen"), the platform empowers individuals, cross-functional squads, and multi-national enterprises to plan seamlessly, communicate transparently, and execute decisively.

### Core Brand Pillars
1. **Clarity over Clutter:** Every pixel, margin, and typography scale is calibrated to reduce visual noise. High information density without claustrophobia.
2. **Speed & Fluidity:** Instant feedback states, optimistic UI patterns, fluid micro-interactions, and keyboard-first accessibility.
3. **Enterprise Robustness:** Bank-grade security posture, multi-tenant workspace isolation, audit trails, and deterministic permissions communicated through solid, dependable visual language.
4. **Human Collaboration:** Personable team presence, expressive status indicators, and clean avatar stacking inspired by top-tier modern productivity tools.

---

## 2. Official Brand Logos & Assets

Workzen maintains three official vector logo variants in SVG format, located in both `src/client/assets/logos/` and `docs/design/brand/`:

| Logo Asset | File Path | Usage Context |
| :--- | :--- | :--- |
| **Primary Logo** | `src/client/assets/logos/workzen-logo-primary.svg` | Light backgrounds, marketing headers, invoice templates, reports |
| **Dark Mode Logo** | `src/client/assets/logos/workzen-logo-dark.svg` | Dark sidebars, dark theme mode, hero gradient banners |
| **Monogram Icon** | `src/client/assets/logos/workzen-icon.svg` | Browser favicons, app launcher icons, collapsed sidebars, mobile headers |

### Logo Construction & Symbolism
- **The Geometry:** An energetic chevron fused with a diamond prism, symbolizing forward velocity (work) balancing on a tranquil geometric axis (zen).
- **The Gradient:** Linear transition from Royal Violet (`#6366F1`) to Deep Electric Indigo (`#4338CA`), echoing the premium aesthetic established in the Flowstack/Loqo design research.
- **Clear Space:** A minimum exclusion zone equal to the height of the icon monogram ($1X$) must be maintained around the wordmark at all times.
- **Minimum Size:**
  - Full wordmark: Minimum height of $28\text{px}$ digital, $10\text{mm}$ print.
  - Monogram icon: Minimum size of $20\text{px} \times 20\text{px}$.

---

## 3. Official Color Palette & Semantics

The Workzen palette combines deep rich slate neutrals with vibrant, accessible accent hues designed to meet strict WCAG AAA / AA contrast ratios.

### Primary Indigo & Violet Scales (Action & Brand)
- **Primary 50 (`#EEF2FF`):** Light active state backgrounds, soft badges
- **Primary 100 (`#E0E7FF`):** Hover backgrounds, active tab pills
- **Primary 500 (`#6366F1`):** Accent highlights, focus rings, secondary CTAs
- **Primary 600 (`#4F46E5`):** **Primary Brand CTA**, main action buttons, active navigation
- **Primary 700 (`#4338CA`):** Dark gradient stops, active pressed states
- **Primary 900 (`#312E81`):** High-contrast text on light indigo tints

### Surface & Neutral Palette (Slate)
- **Background Main (`#F8FAFC`):** App workspace background, low eyestrain canvas
- **Surface Elevated (`#FFFFFF`):** Kanban cards, modal sheets, tables, stat containers
- **Border Subtle (`#E2E8F0`):** Card borders, divider rules, subtle input outlines
- **Text Muted / Secondary (`#64748B`):** Metadata, timestamps, helper descriptions
- **Text Headings / Primary (`#0F172A`):** Page titles, primary metrics, high-emphasis text
- **Dark Surface (`#0F172A`):** Dark mode canvas, hero banner gradients, code blocks

### Semantic Feedback & Priority Palette
- **Success (`#10B981` / Light `#ECFDF5`):** "Done" tasks, positive trends, verified badges
- **Warning (`#F59E0B` / Light `#FFFBEB`):** "Review" tasks, approaching deadlines, cautions
- **Danger (`#EF4444` / Light `#FEF2F2`):** "Urgent" priority, overdue items, destructive CTAs
- **Info (`#3B82F6` / Light `#EFF6FF`):** "In Progress" statuses, informational tooltips

---

## 4. Typography Scale & Hierarchy

Workzen utilizes a multi-tiered font stack anchored by **Inter**, falling back gracefully to system sans-serif metrics (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`).

| Token | Font Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `display` | $36\text{px}$ ($2.25\text{rem}$) | $44\text{px}$ | 800 (Extrabold) | Landing hero headlines, major marketing headers |
| `h1` | $28\text{px}$ ($1.75\text{rem}$) | $36\text{px}$ | 700 (Bold) | Main screen titles (Dashboard, Kanban, Analytics) |
| `h2` | $22\text{px}$ ($1.375\text{rem}$) | $30\text{px}$ | 700 (Bold) | Section headers, card group titles |
| `h3` | $18\text{px}$ ($1.125\text{rem}$) | $26\text{px}$ | 600 (Semibold) | Modal titles, widget headers, card titles |
| `body` | $14\text{px}$ ($0.875\text{rem}$) | $22\text{px}$ | 400 (Regular) | Default table text, descriptions, form inputs |
| `bodyMedium`| $14\text{px}$ ($0.875\text{rem}$) | $22\text{px}$ | 500 (Medium) | Table headers, interactive labels, menu items |
| `small` | $12\text{px}$ ($0.75\text{rem}$) | $18\text{px}$ | 500 (Medium) | Badges, metadata, timestamp indicators, avatars |
| `tiny` | $10\text{px}$ ($0.625\text{rem}$) | $14\text{px}$ | 600 (Semibold) | Micro pills, status badges, counter dots |

---

## 5. Spacing, Radii & Depth Scale

- **Grid Basis:** $8\text{px}$ base increment ($4\text{px}$ micro-adjustments).
  - Spacing tokens: `xs` ($4\text{px}$), `sm` ($8\text{px}$), `md` ($16\text{px}$), `lg` ($24\text{px}$), `xl` ($32\text{px}$), `2xl` ($48\text{px}$).
- **Corner Radii:**
  - `sm` ($6\text{px}$): Form inputs, small badges.
  - `md` ($10\text{px}$): Kanban cards, buttons, dropdown popovers.
  - `lg` ($16\text{px}$): Large dashboard stat widgets, elevated modals.
  - `full` ($9999\text{px}$): Avatars, priority pills, status indicator tags.
- **Elevation Shadows:**
  - `subtle`: `0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)` (Cards at rest)
  - `hover`: `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)` (Card lift on hover)
  - `modal`: `0 20px 25px -5px rgba(0,0,0,0.12), 0 10px 10px -5px rgba(0,0,0,0.04)` (Floating overlays)

