# Specification: Vortex Kinetic Stream Landing Page

## 1. Overview
We will elevate the existing `/vortex` page into a "Swiss-God" tier landing experience. This involves merging the existing `VortexHeroV2` and `KineticTrack` structure with the high-fidelity "Braun-ish" industrial aesthetic and "WorkflowEngine" animation logic from the inspiration project. The goal is to create a seamless, scroll-linked narrative that begins with the Hero, flows into the Manifesto, and culminates in a visual demonstration of the generative workflow (Schematic -> Processing -> Product).

## 2. Functional Requirements

### 2.1 Core Narrative & Interaction
*   **Sequential Scroll-Triggered Animation:**
    *   **Act I (Hero):** Users land on the clean, typography-led `VortexHeroV2`.
    *   **Act II (Manifesto):** Scroll triggers the existing horizontal `KineticTrack` blocks. This position is fixed and immutable.
    *   **Act III (The Machine):** After the manifesto blocks have scrolled through, the view "zooms" into the `WorkflowEngine` schematic layer.
    *   **Act IV (Processing):** The node-graph animation plays (packets moving, nodes pulsing).
    *   **Act V (Output):** The schematic resolves into a final "Product" card/section.
*   **Visual Style:**
    *   **Palette:** "Swiss Black" (`#1a1a1a`), White/Off-White (`#f4f4f0`), and "International Orange" (`#FF4400`) for active states.
    *   **Typography:** Cabinet Grotesk for headlines and JetBrains Mono for metadata.

### 2.2 Component Porting & Refactoring
*   **`WorkflowEngine` Adaptation:**
    *   Refactor the sequencer to a **GSAP Timeline**.
    *   Implement `WorkflowCanvas` nodes with crisp SVG rendering.
*   **Integration:**
    *   Ensure `VortexContainer` orchestrates the hand-off from `KineticTrack` to `WorkflowEngine`.

## 3. Non-Functional Requirements
*   **Performance:** Proper `gsap.context` cleanup; will-change optimizations.
*   **Responsiveness:** Scale node graph for mobile.

## 4. Acceptance Criteria
*   [ ] The `/vortex` page renders without hydration errors.
*   [ ] Manifesto follows Hero exactly as before.
*   [ ] Workflow Engine transitions in only AFTER the manifesto is complete.
*   [ ] GSAP timeline is smooth and scrubbable.
*   [ ] Design matches the "Braun Industrial" aesthetic.
