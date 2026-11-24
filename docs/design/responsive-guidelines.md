# WORKZEN — Responsive Design & Mobile Guidelines

> **Product:** WORKZEN Enterprise SaaS  
> **Target Devices:** Desktop ($1280\text{px}+$ / $1920\text{px}$), Laptops ($1024\text{px} - 1279\text{px}$), Tablets ($768\text{px} - 1023\text{px}$), Mobile ($360\text{px} - 767\text{px}$)

---

## 1. Responsive Breakpoint Matrix

Workzen adopts standard responsive breakpoints aligned with Bootstrap and Material UI:

| Breakpoint | Range | Navigation Pattern | Layout Structure |
| :--- | :--- | :--- | :--- |
| **xs** (Mobile Portrait) | $< 576\text{px}$ | Hidden sidebar, sticky header, **Bottom Mobile App Bar** | 1 Column, full-width cards, vertical scrolling |
| **sm** (Mobile Landscape) | $576\text{px} - 767\text{px}$ | Off-canvas drawer trigger + bottom app bar | 1 - 2 Columns adaptive grid |
| **md** (Tablet) | $768\text{px} - 991\text{px}$ | Collapsible icon sidebar ($64\text{px}$), top header | 2 Columns, horizontal scroll Kanban |
| **lg** (Desktop Standard) | $992\text{px} - 1199\text{px}$ | Persistent full sidebar ($240\text{px}$) | Multi-column grid, 3-column Kanban |
| **xl** (Enterprise Widescreen)| $\ge 1200\text{px}$ | Persistent expanded sidebar ($260\text{px}$) | Full 4-5 column Kanban, multi-widget dashboards |

---

## 2. Mobile Experience Architecture (Ref: TaskGenius)

Inspired by the TaskGenius mobile design reference:

1. **Bottom Navigation Bar (`MobileNav.tsx`):**
   - Fixed at bottom of screen with `safe-area-inset-bottom` support for iOS devices.
   - 4 primary navigation slots:
     - **Home / Dashboard:** Instant access to overview metrics and urgent tasks.
     - **Projects / Kanban:** Board view with horizontal swipe capability.
     - **Reports / Analytics:** Completion rate donuts and weekly charts.
     - **Team / Profile:** Collaboration, assignments, and account settings.
   - **Floating Quick-Action Button ("+"):** Centered pill button allowing one-tap task creation from any screen.
2. **Thumb Zone Optimization:**
   - Critical interactive controls (Create Task, Filters, Navigation tabs) are positioned within the natural arc of the user's thumb (bottom $40\%$ of the viewport).
   - Destructive actions (Delete Project, Archive) are placed in secondary menus with explicit two-step confirmation modals.
3. **Touch Target Dimensions:**
   - Minimum tap target: $44\text{px} \times 44\text{px}$ (exceeding WCAG 2.1 AA requirement of $24\text{px}$).
   - Generous touch margins ($8\text{px}$ minimum between adjacent interactive elements).

---

## 3. Desktop Experience Architecture (Ref: FlowTask & Scopeboard)

1. **Left Sidebar Organization:**
   - Top: Workzen logo and active workspace switcher dropdown.
   - Core Navigation: Dashboard, My Tasks, Inbox, Calendar, Reports.
   - Projects Section: Starred/recent projects with colored category indicator dots and quick "+" trigger.
   - Bottom: User avatar profile, workspace storage indicator, and dark mode toggle.
2. **Top Application Bar:**
   - Global contextual search bar (`⌘K` / `Ctrl+K` keyboard shortcut).
   - Quick filters, notifications bell with unread badge counter, and primary "+ New Task" button.
3. **Workspace Surface Canvas:**
   - High information density without visual crowding.
   - Smooth horizontal scroll for Kanban boards with preserved column header pinning.
   - Card lift hover micro-interactions (`translateY(-2px)`).

