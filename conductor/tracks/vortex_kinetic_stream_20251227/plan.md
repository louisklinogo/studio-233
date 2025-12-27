# Implementation Plan - Vortex Kinetic Stream Landing Page

## Phase 1: Foundation & Setup [checkpoint: 86f57b0]
- [x] Task: Update `metadata.json` for `vortex_kinetic_stream_20251227`.
- [x] Task: Initialize `vortex-v2-evolution` branch. (b3340bf)
- [x] Task: Verify GSAP and ScrollTrigger installation in `apps/web`. (9cc8b86)
- [x] Task: Clean up existing `/vortex` page (remove unused horizontal scroll components if redundant). (7bec9c6)
- [ ] Task: Conductor - User Manual Verification 'Foundation & Setup' (Protocol in workflow.md)

## Phase 2: Act I - Hero Section Evolution [checkpoint: bea8b8f]
- [x] Task: Create `VortexHeroV2` with "System Manual" typography. (7ca1a88)
- [x] Task: Implement mouse-tracking coordinate logic (coordinates hook). (9609974)
- [x] Task: Add "Identifier Barcode" visual element (audio-reactive style). (9609974)
- [x] Task: Conductor - User Manual Verification 'Act I - Hero Section' (739df15)

## Phase 3: Act II - The Workflow Engine Structure [checkpoint: 16b2acd]
- [x] Task: Create `WorkflowEngine` container. (eae69a1)
- [x] Task: Implement `WorkflowCanvas` with crisp SVG Node rendering. (eae69a1)
- [x] Task: Implement "Braun" Node styling (Swiss Orange accents, precise borders). (eae69a1)
- [x] Task: Create `GeneratedProduct` with wireframe and rendered states. (eae69a1)
- [x] Task: Conductor - User Manual Verification 'Act II - The Workflow Engine Structure' (eae69a1)

## Phase 4: Act III - Kinetic Animation (GSAP)
- [ ] Task: Implement `useWorkflowTimeline` hook.
- [ ] Task: Sequence "Act I (Hero)" -> "Zoom In" -> "Data Packets" -> "Act IV (Product Reveal)".
- [ ] Task: Bind GSAP Timeline to ScrollTrigger with pinning logic.
- [ ] Task: Conductor - User Manual Verification 'Act III - Kinetic Animation' (Protocol in workflow.md)

## Phase 5: Integration & Polish
- [ ] Task: Assemble components into the main `/vortex` page.
- [ ] Task: Implement "Curtain Split" transition for Hero elements.
- [ ] Task: Mobile responsiveness and performance audit.
- [ ] Task: Conductor - User Manual Verification 'Integration & Polish' (Protocol in workflow.md)