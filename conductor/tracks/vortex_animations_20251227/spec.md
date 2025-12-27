# Track Specification: Vortex Animation & Interaction Refinement

## 1. Overview
**Goal:** Transform the transition from Act I (Hero) to Act II (Kinetic Track) into a high-fidelity, mechanical narrative where the brand ("233") acts as the physical origin point for the manifesto.
**Problem:** Currently, the transition is a disconnected jump. The orange background fades prematurely, and the "233" flies off-screen, losing the "signal" before the "process" begins.
**Solution:** Implement the "233 Aperture" mechanic. The "233" text becomes a persistent right-hand anchor that "prints" the Kinetic Track blocks into the viewport, bridging the Hero's energy with the Manifesto's logic.

## 2. Functional Requirements
### 2.1 The 233 Aperture Transition
*   **Persistent Anchor:** Modify `VortexContainer.tsx` so the "233" (`numericRef`) slides to the far right edge but remains on screen.
*   **Mechanical Shutter:** Implement a "decryption" animation for the "233" where it rapidly cycles through characters before locking into place as a fixed HUD element.
*   **Background Bridge:** Sustain the orange background (`#FF4400`) during the initial blocks' emergence.
*   **The Wipe:** Implement a horizontal "push" or "wipe" transition where the first block of the Kinetic Track appears to physically displace the orange background to reveal the "Paper" (#f4f4f0) grid.

### 2.2 Kinetic Track Refinement
*   **Mechanical Slide:** Adjust the entrance animation of `HoverBlock` elements to emerge from the right edge as if being "extruded" from the 233 Aperture.
*   **Subtle Parallax:** Implement a parallax effect on the images (`REF_01` etc.) within the blocks, making them move slightly slower than the containing block.
*   **Vertical HUD Grid:** Add thin, flickering vertical technical lines in the background of the `KineticTrack` that display dynamic coordinates.
*   **Orange Pulse:** Integrate subtle orange (`#FF4400`) pulses or small progress indicators on specific "refiner" words (e.g., PURITY, LOGIC, SIGNAL) to maintain brand continuity.

## 3. Non-Functional Requirements
*   **Braun/Swiss Aesthetic:** Maintain extreme visual clarity. No blurry shadows; depth must be achieved through scale and parallax.
*   **Apple-Grade Fluidity:** Ensure all GSAP transitions use physics-informed eases (`power4.out`, `expo.inOut`) to feel mechanical yet smooth.
*   **Performance:** Animation must maintain 60fps. Use `force3D: true` and `will-change: transform` on all moving elements.

## 4. Acceptance Criteria
*   [ ] The "233" text remains visible at the right edge during the entire transition to the Kinetic Track.
*   [ ] The first words of the manifesto ("WE BUILD FOR...") appear to emerge directly from the 233 anchor point.
*   [ ] The orange background is wiped away by the movement of the Kinetic Track, not faded.
*   [ ] Parallax effect is visible and smooth within the interactive blocks.
*   [ ] Technical HUD lines are present and move in sync with the grid.

## 5. Out of Scope
*   Modifying the `WorkflowEngine` nodes or logic (Act V).
*   Changing the "Story" paragraphs or redaction logic (Act III).
*   Adding 3D WebGL models (staying within DOM/SVG/CSS).
