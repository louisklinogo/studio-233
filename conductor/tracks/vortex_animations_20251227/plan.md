# Implementation Plan: Vortex Animation & Interaction Refinement

Refining the Hero-to-Track transition and hardening the Kinetic Track visuals to meet "Swiss-God" industrial standards.

## Phase 1: Infrastructure & Transition Base [ ]
- [~] Task: Update `VortexHeroHandle` and `VortexHeroV2.tsx` to ensure `numericRef` and `surface` are optimized for persistent display.
- [ ] Task: Update `VortexContainer.tsx` GSAP timeline to keep the "233" (`numeric`) on screen at the right edge instead of flying out.
- [ ] Task: Implement the "Background Wipe" transition logic where the orange surface is displaced by the incoming track.
- [ ] Task: Conductor - User Manual Verification 'Infrastructure & Transition Base' (Protocol in workflow.md)

## Phase 2: The 233 Aperture Shutter [ ]
- [ ] Task: Write failing test/verification for the "233" decryption/shutter animation (verifying ref accessibility and animation state).
- [ ] Task: Implement the mechanical "shutter/decryption" animation for the "233" text in `VortexHeroV2.tsx`.
- [ ] Task: Sync the shutter lock-in with the arrival of the first Kinetic Track block in `VortexContainer.tsx`.
- [ ] Task: Conductor - User Manual Verification 'The 233 Aperture Shutter' (Protocol in workflow.md)

## Phase 3: Kinetic Track Hardening [ ]
- [ ] Task: Implement CSS-based parallax for `HoverBlock` images (Ref_01 - Ref_05) using GSAP or CSS variables.
- [ ] Task: Add the "Vertical HUD Grid" component to the `KineticTrack` background with flickering coordinate text.
- [ ] Task: Implement the "Orange Pulse" heartbeat on refiner words in `KineticTrack.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Kinetic Track Hardening' (Protocol in workflow.md)

## Phase 4: Final Polish & Verification [ ]
- [ ] Task: Perform a full regression sweep of the Vortex scroll flow to ensure Act transitions (I-V) remain smooth.
- [ ] Task: Verify 60fps performance and hardware acceleration (force3D) across all new animations.
- [ ] Task: Conductor - User Manual Verification 'Final Polish & Verification' (Protocol in workflow.md)
