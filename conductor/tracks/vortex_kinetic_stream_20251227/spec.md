# Specification: Vortex Kinetic Stream Landing Page

## 1. Overview
We will elevate the existing `/vortex` page into a "Swiss-God" tier landing experience. This involves merging the existing `VortexHero` and `KineticTrack` structure with the high-fidelity "Braun-ish" industrial aesthetic and "WorkflowEngine" animation logic from the inspiration project. The goal is to create a seamless, scroll-linked narrative that visually demonstrates the Studio+233 generative workflow (Idea -> Schematic -> Processing -> Product) with AWWWARDS-worthy polish.

## 2. Functional Requirements

### 2.1 Core Narrative & Interaction
*   **Hybrid Scroll-Triggered Animation:**
    *   **Act I (Hero):** Users land on a clean, typography-led hero (adapting `Hero.tsx` from inspiration). Scroll initiates a transition.
    *   **Act II (The Machine):** As the user scrolls, the view "zooms" into a schematic layer (The `WorkflowCanvas`).
    *   **Act III (Processing):** The node-graph animation (packets moving, nodes pulsing) plays automatically once locked in view or scrubs with scroll (Designer's discretion for best feel).
    *   **Act IV (Output):** The schematic resolves into a final "Product" card/section.
*   **Visual Style:**
    *   **Palette:** "Swiss Black" (`#1a1a1a`), White/Off-White (`#f4f4f0`), and "International Orange" (`#FF4400` / `#D81E05`) for active states.
    *   **Typography:** Mix of large, tight-tracking sans-serif for headlines and mono-spaced fonts for metadata/technical labels.
    *   **Grid:** Explicit, thin grid lines (opacity < 10%) visible in the background to ground the industrial feel.

### 2.2 Component Porting & Refactoring
*   **`WorkflowEngine` Adaptation:**
    *   Refactor the `setTimeout` based sequencer to a **GSAP Timeline**. This allows for precise control, pausing, and scrubbing.
    *   Re-implement `WorkflowCanvas` nodes using the project's existing UI primitives or clean HTML/SVG where necessary, ensuring crisp rendering on high-DPI screens.
    *   **Constraint:** Ensure the "infinite canvas" feel works responsively.

*   **Integration with Existing `/vortex`:**
    *   Retain `VortexLenis` for smooth scrolling.
    *   Retain `CustomCursor` but ensure it reacts (magnetism/scale) to the new interactive elements.
    *   Update `VortexHero` to match the `Hero.tsx` aesthetic (Typography + Mouse-tracking coordinates).

## 3. Non-Functional Requirements
*   **Performance:**
    *   Use `gsap.context` for proper cleanup in React `useEffect`.
    *   Optimize SVG animations (will-change properties).
    *   Ensure Lighthouse Performance score > 90.
*   **Responsiveness:**
    *   The node graph must remain legible on mobile (scale down or simplify).
    *   Scroll triggers must vary appropriately for touch vs. mouse.
*   **Code Quality:**
    *   Strict TypeScript typing for all node data and GSAP contexts.
    *   Modularize the animation logic (separate hook or utility).

## 4. Acceptance Criteria
*   [ ] The `/vortex` page renders without hydration errors.
*   [ ] The "Hero" section displays mouse-tracking coordinates and the "System Manual" typographic layout.
*   [ ] Scrolling down smoothly transitions (zooms/scales) into the `WorkflowEngine` view.
*   [ ] The Workflow animation (nodes activating, packets flowing) plays correctly via GSAP.
*   [ ] The design matches the "Braun Industrial" aesthetic (Orange accents, mono fonts, grids).
*   [ ] `eslint` and `tsc` pass with no errors.

## 5. Out of Scope
*   Backend integration (real AI generation). This is a purely frontend motion design showcase.
*   Full site navigation rebuild (focus only on the Vortex page content).