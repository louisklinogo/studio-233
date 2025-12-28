# Implementation Plan: Vortex Animation & Interaction Refinement (Kinetic Lock)

Refining the transition into a "Decryption Glyph" sequence, a "Kinetic Flip" handover, and a "Vertical Magazine" manifesto.

## Phase 1: Infrastructure & Glyph logic [checkpoint: 592ce00]
- [x] Task: Update `VortexHeroV2.tsx` to include `blackBoxRef`, `bracketsRef`, and the character cycling logic.
- [x] Task: Implement the "Decryption Glyph" method in `VortexHeroV2.tsx` to flicker through `[CANVAS]`, `[STUDIO]`, `[AGENTIC]`.
- [x] Task: Update `KineticTrack.tsx` to support vertical `flex-col` stacking and the `shutter-overlay` DOM structure.
- [x] Task: Conductor - User Manual Verification 'Glyph Infrastructure' (Protocol in workflow.md) 592ce00

## Phase 2: The Kinetic Flip Handover [checkpoint: 93e7930]
- [x] Task: Implement the "Kinetic Flip" in `VortexContainer.tsx` (centered 233 folds out, Black Box folds in).
- [x] Task: Synchronize the "Success Flash" orange border micro-interaction.
- [x] Task: Implement the exponential scale-up of the Black Box to fill the viewport.
- [x] Task: Conductor - User Manual Verification 'Flip Handover' (Protocol in workflow.md) 93e7930

## Phase 3: Vertical Magazine Reveal [checkpoint: d29acc8]
- [x] Task: Implement the "Rising Plates" GSAP sequence in `VortexContainer.tsx`.
- [x] Task: Implement the "Mechanical Shutter" reveal (slide down) triggered when blocks hit the screen center.
- [x] Task: Integrate "Assembly Rails" HUD lines and dynamic metadata flickering.
- [x] Task: Conductor - User Manual Verification 'Vertical Magazine' (Protocol in workflow.md) d29acc8

## Phase 4: Final Polish & Act Integration [ ]
- [ ] Task: Perform full regression sweep of Act I -> II -> III.
- [ ] Task: Ensure scroll-back stability (no malformed states).
- [ ] Task: Verify 60fps performance across the entire transition.
- [ ] Task: Conductor - User Manual Verification 'Final Polish' (Protocol in workflow.md)