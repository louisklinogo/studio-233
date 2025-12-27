# Plan: Vortex Kinetic Stream

## Phase 1: Infrastructure & Setup [checkpoint: b13a9ad]
- [x] Task: Create `VortexContainer` Component (66badfd)
    - Create a new component `src/components/landing/VortexContainer.tsx` that will act as the parent orchestrator.
    - Implement the basic HTML structure: A fixed viewport wrapper and the scrollable "track" height (e.g., 300vh).
    - **Test:** Verify the component renders and creates the correct scrollable height.
- [x] Task: Refactor `VortexHero` for Composition (974b716)
    - Modify `VortexHero.tsx` to accept props or ref forwarding if necessary, or simply prepare it to be a child of `VortexContainer`.
    - Remove the internal `ScrollTrigger` pinning logic from `VortexHero` as the parent `VortexContainer` will handle the global timeline.
    - **Test:** Verify `VortexHero` renders correctly as a static element within the new container.

## Phase 2: The Curtain Split (Hero Transition) [checkpoint: e40b863]
- [x] Task: Implement Hero "Split" Animation (8dd863b)
    - In `VortexContainer`, set up the initial GSAP timeline.
    - Pin the main container.
    - Target the `VortexHero` elements (Studio, +, 233).
    - Implement the "Curtain Split": `x` translation for text, `rotation` for the cross.
    - **Test:** Verify the animation plays correctly on scroll and the text moves to the edges.
- [ ] Task: Conductor - User Manual Verification 'The Curtain Split' (Protocol in workflow.md)

## Phase 3: The Kinetic Stream (Manifesto Implementation) [checkpoint: 822c116]
- [x] Task: Create `KineticTrack` Component (dc3bb14)
- [x] Task: Implement Horizontal Scroll Logic (828efe0)
- [x] Task: Conductor - User Manual Verification 'The Kinetic Stream' (Protocol in workflow.md)

## Phase 4: Swiss Polish (Parallax & Physics) [checkpoint: a6c7750]
- [x] Task: Implement Parallax Depth
- [x] Task: Implement Velocity Skew
- [x] Task: Implement Focus/Opacity Range
- [x] Task: Conductor - User Manual Verification 'Swiss Polish' (Protocol in workflow.md)

## Phase 5: Integration & Cleanup
- [x] Task: Replace Old Page Content
- [x] Task: Final Polish & Performance Check
- [x] Task: Conductor - User Manual Verification 'Integration & Cleanup' (Protocol in workflow.md)
