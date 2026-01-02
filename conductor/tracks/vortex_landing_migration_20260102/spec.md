# Specification: Vortex Landing Migration & Login Overhaul

## Overview
Transition the **Vortex Kinetic Stream** to be the primary project entry point (root `/`), integrating the **Infinite Archive** as a spatial transport layer, and overhauling the **Authentication Gateway** with a high-fidelity "Physical Transaction" aesthetic.

## Functional Requirements
1.  **System Handshake (Boot Sequence):**
    *   Replace particle-based boot with a "Calibration Sequence."
    *   Animate the construction of the `VortexHeroV2` grid and "Matte Black Core" using GSAP draw-SVG/line animations.
    *   Use ScrambleText for system-readiness telemetry during boot.
2.  **Sequential Kinetic Stream (The Vortex):**
    *   **Act I:** Vortex Hero (Calibration & Entry).
    *   **Act II:** Kinetic Track (The Manifesto).
    *   **Act III:** Production Engine (The Substrate Layer).
    *   **Act IV:** Infinite Archive (The Tunnel Transport).
    *   **Act V:** Infinite Canvas (The Result Space).
3.  **Scroll Orchestration:**
    *   Migrate the stream to **Locomotive Scroll v5** to provide "Tactile Weight" and momentum.
    *   Sync Three.js camera Z-depth in Act IV directly to Locomotive scroll progress.
4.  **Authentication Overhaul:**
    *   **Physical Toggle:** Implement a Braun-inspired skeuomorphic sliding switch to toggle auth modes.
    *   **Animated Receipt:** Use `clip-path` and GSAP to animate the ticket "printing" from a slot in the UI.
    *   **HUD Continuity:** Inherit `SystemHUD` and `GlitchHeader` from the landing page.

## Non-Functional Requirements
*   **Performance:** Maintain 60fps across all transitions. Cap Three.js pixel ratio at 1.5 for mobile.
*   **Memory:** Explicitly call `.dispose()` on R3F geometries/textures when Act IV is exited.
*   **Swiss Aesthetic:** Adhere to Dieter Rams' principles—neutral palette (`#f4f4f0` / `#0a0a0a`), orange accents (`#FF4D00`), and absolute restraint in motion.

## Acceptance Criteria
*   [ ] Root URL (`/`) loads the Vortex sequence.
*   [ ] Boot sequence transitions seamlessly into the Hero without an "overlay fade" feel.
*   [ ] Scroll momentum feels "heavy" and mechanical via Locomotive Scroll.
*   [ ] The Infinite Tunnel correctly bridges the Production Engine and the Canvas.
*   [ ] Login page features a functional skeuomorphic toggle and "printed" receipt animation.
