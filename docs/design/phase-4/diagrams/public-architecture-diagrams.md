# WORKZEN — Phase 4 Public Architecture & Workflow Diagrams

This document contains the official architecture, component hierarchy, navigation, data flow, and verification diagrams for Phase 4 of **WORKZEN**.

---

## Diagram 1: Public Website Page Architecture

```mermaid
flowchart TD
    subgraph PublicDomain["WORKZEN Public Website Domain"]
        LANDING["Landing Page (19 Sections)"]
        FEATURES["Features Page (12 Modules)"]
        SOLUTIONS["Solutions Page (7 Personas)"]
        PRICING["Pricing Page (3 Plans + Paystack/Stripe Ready)"]
        ABOUT["About Page (Mission & Core Values)"]
        CONTACT["Contact Page (Inquiry Form + Validation)"]
        FAQ["FAQ Page (Searchable Accordion)"]
    end

    subgraph Layout["Public Shell Layout"]
        NAV["PublicNavbar (Desktop + Mobile Drawer)"]
        FOOT["PublicFooter (4 Columns + Copyright)"]
    end

    NAV --> LANDING & FEATURES & SOLUTIONS & PRICING & ABOUT & CONTACT & FAQ
    LANDING & FEATURES & SOLUTIONS & PRICING & ABOUT & CONTACT & FAQ --> FOOT
```

---

## Diagram 2: Public Navigation Structure

```mermaid
flowchart LR
    Root["Public Root Navigation"] --> Brand["WORKZEN Brand Logo"]
    Root --> Links["Desktop Menu Bar"]
    Root --> Actions["Action CTAs"]
    Root --> Mobile["Mobile Hamburger Trigger"]

    Links --> L1["Home"]
    Links --> L2["Features"]
    Links --> L3["Solutions"]
    Links --> L4["Pricing"]
    Links --> L5["About"]
    Links --> L6["FAQ"]
    Links --> L7["Contact"]

    Actions --> A1["Sign In -> Phase 5 Auth"]
    Actions --> A2["Start Free Trial -> Register"]

    Mobile --> Drawer["Slide-out Off-Canvas Drawer (320px)"]
    Drawer --> DrawerLinks["Full Navigation Links + CTAs"]
```

---

## Diagram 3: Landing Page Component Hierarchy

```mermaid
graph TD
    Landing[LandingPage Root]
    
    Landing --> S1[PublicNavbar]
    Landing --> S2[Hero Section with Gradient Mesh]
    Landing --> S3[Interactive Kanban Preview Canvas]
    Landing --> S4[Customer Problems 3-Card Grid]
    Landing --> S5[Platform Capabilities 4-Card Grid]
    Landing --> S6[3 Strategic Benefits Pillars]
    Landing --> S7[How Workzen Works 3-Step Flow]
    Landing --> S8[Target Use Cases Grid]
    Landing --> S9[Pricing Preview Cards]
    Landing --> S10[FAQ Accordion Preview]
    Landing --> S11[Final Conversion Call-To-Action]
    Landing --> S12[PublicFooter]
```

---

## Diagram 4: Public Website Routing & State Flow

```mermaid
flowchart TD
    User([Website Visitor]) --> ViewRouter{Zustand Store: publicPage}
    
    ViewRouter -->|'landing'| LandingPage
    ViewRouter -->|'features'| FeaturesPage
    ViewRouter -->|'solutions'| SolutionsPage
    ViewRouter -->|'pricing'| PricingPage
    ViewRouter -->|'about'| AboutPage
    ViewRouter -->|'contact'| ContactPage
    ViewRouter -->|'faq'| FAQPage

    ViewRouter -->|'login'| LoginPage
    ViewRouter -->|'register'| RegisterPage
    ViewRouter -->|'app'| EnterpriseDashboard

    PrototypeDock[Floating Prototype Hub] -.->|Direct Jump| ViewRouter
```

---

## Diagram 5: Contact Form Data Flow & Validation

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Enterprise Visitor
    participant UI as ContactPage Form
    participant Schema as Zod Contact Schema
    participant Client as API Client

    Visitor->>UI: Enters Name, Work Email, Subject, Message
    Visitor->>UI: Clicks "Send Message ->"
    UI->>Schema: Validates field lengths & email format
    alt Validation Fails
        Schema-->>UI: Returns Field Errors
        UI-->>Visitor: Displays Inline Error Feedback & Focuses Field
    else Validation Passes
        UI->>UI: Sets Submitting State (Loading Spinner)
        UI->>Client: Transmits payload
        Client-->>UI: Success Acknowledgement
        UI-->>Visitor: Renders Success Confirmation & Clears Form
    end
```

---

## Diagram 6: SEO & Metadata Architecture

```mermaid
flowchart TD
    subgraph MetadataLayer["Client & Server SEO Layer"]
        DOC["index.html Document Head"]
        SEO_HELPER["SEO Head Manager Helper"]
        ROBOTS["public/robots.txt"]
        SITEMAP["public/sitemap.xml"]
    end

    subgraph OpenGraph["Open Graph & Social Graph"]
        OG_TITLE["og:title: Workzen Enterprise SaaS"]
        OG_DESC["og:description: Plan Smarter. Work Together. Achieve More."]
        OG_TYPE["og:type: website"]
        CANONICAL["rel=canonical URL"]
    end

    SEO_HELPER --> DOC
    DOC --> OpenGraph
    ROBOTS --> SITEMAP
```

---

## Diagram 7: Prototype-to-Implementation Comparison Workflow

```mermaid
flowchart LR
    P1["1. Render Phase 4 Prototypes<br>(17 PNGs in docs/design/phase-4/prototypes/)"] --> P2["2. Build Production Components<br>(PublicLayout, LandingPage, Features, etc.)"]
    P2 --> P3["3. Capture Implemented Screenshots<br>(docs/design/phase-4/screenshots/)"]
    P3 --> P4["4. Compare Pixel Layout & Hierarchy<br>(Desktop, Tablet & Mobile Matrix)"]
    P4 --> P5["5. Fix Visual Inconsistencies<br>(Spacing, Typography, Contrast, States)"]
    P5 --> P6["6. Automated Verification & Quality Gates<br>(Tests, Typecheck, Build, Review)"]
```

