# Track Specification: Vortex Animation & Interaction Refinement (Act II: The Kinetic Lock)

## 1. Overview
**Goal:** Implement a high-fidelity "Decryption -> Flip -> Rise" transition sequence. This replaces the previous horizontal scroll with a user-focused, vertical "Assembly Line" narrative.
**Solution:** The "233" text will glyph through technical keywords before centering. At the center, it will perform a "Kinetic Flip" into a Matte Black Box that expands to cover the orange Hero field. The Manifesto will then emerge as a vertical sequence of rising plates with mechanical shutter reveals.

## 2. Functional Requirements
### 2.1 The Decryption Glyph (Act I Transition)
*   **Keyword Cycling:** As "233" travels to the center, it must rapidly cycle through the following strings: `[CANVAS]`, `[STUDIO]`, `[AGENTIC]`, before locking back to `233`.
*   **Slam Lock:** The final transition to `233` should feel heavy and mechanical.

### 2.2 The Kinetic Flip (The Handover)
*   **3D Handover:** Use `transform-style: preserve-3d` to rotate the "233" text 90° out (X-axis) and the Matte Black Box 90° in.
*   **Visual Success Flash:** Animate a 1px orange (#FF4400) border around the box for 0.1s upon completion of the flip.
*   **Exponential Expansion:** The box scales exponentially until it covers the viewport, revealing the black production environment.

### 2.3 The Vertical Magazine (Manifesto)
*   **Rising Plates:** Refactor `KineticTrack.tsx` into a vertical `flex-col` stack.
*   **Mechanical Shutter:** Implement a `shutter-overlay` div for each block that slides vertically to reveal text when the block hits the screen center.
*   **Interaction:** Link the shutter slide speed to the user's scroll velocity.

### 2.4 HUD Integration (Act II Visuals)
*   **Assembly Rails:** Two vertical dashed lines at the screen gutters.
*   **Dynamic Metadata:** Flicker technical status logs (`[STATE: PROCESSING]`, `[COORD_Y]`) along these rails.

## 3. Non-Functional Requirements
*   **No WebGL:** All effects must be achieved using DOM, SVG, and GSAP.
*   **Material Authenticity:** Use subtle grain overlays and sharp 1px borders to mimic industrial materials.

## 4. Acceptance Criteria
*   [ ] "233" successfully glyphs through keywords during its slide.
*   [ ] The Kinetic Flip is seamless without visual gaps.
*   [ ] The Black Box covers the entire viewport.
*   [ ] Manifesto blocks rise vertically and shutter-reveal in the center.
*   [ ] HUD lines and metadata are visible and responsive.

## 5. Out of Scope
*   Horizontal scrolling (completely removed).
*   3D WebGL meshes.