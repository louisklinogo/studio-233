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

## Phase 2: The Curtain Split (Hero Transition)
- [x] Task: Implement Hero "Split" Animation (8dd863b)
    - In `VortexContainer`, set up the initial GSAP timeline.
    - Pin the main container.
    - Target the `VortexHero` elements (Studio, +, 233).
    - Implement the "Curtain Split": `x` translation for text, `rotation` for the cross.
    - **Test:** Verify the animation plays correctly on scroll and the text moves to the edges.
- [ ] Task: Conductor - User Manual Verification 'The Curtain Split' (Protocol in workflow.md)

## Phase 3: The Kinetic Stream (Manifesto Implementation)
- [ ] Task: Create `KineticTrack` Component
    - Create `src/components/landing/KineticTrack.tsx`.
    - Implement the horizontal layout using Flexbox (`flex-nowrap`).
    - Populate with the existing Manifesto data (text and images).
    - **Test:** Verify the content renders in a horizontal row (overflowing the viewport).
- [ ] Task: Implement Horizontal Scroll Logic
    - In `VortexContainer`, add the horizontal translation to the main timeline.
    - Connect the `x` value of the `KineticTrack` to the scroll progress (e.g., `xPercent: -100 * (sections - 1)`).
    - **Test:** Verify that scrolling vertically translates the track horizontally.
- [ ] Task: Conductor - User Manual Verification 'The Kinetic Stream' (Protocol in workflow.md)

## Phase 4: Swiss Polish (Parallax & Physics)
- [ ] Task: Implement Parallax Depth
    - Select image elements within the track.
    - Apply a secondary motion to them (e.g., `xPercent: 20`) relative to their container to create depth.
- [ ] Task: Implement Velocity Skew
    - Use `ScrollTrigger.velocity` or a proxy object to detect scroll speed.
    - Apply `skewX` to the text elements based on this velocity.
- [ ] Task: Implement Focus/Opacity Range
    - Add a scroll listener (or use the timeline update) to calculate distance from center.
    - Adjust `opacity` and `blur` for elements entering/exiting the viewport.
- [ ] Task: Conductor - User Manual Verification 'Swiss Polish' (Protocol in workflow.md)

## Phase 5: Integration & Cleanup
- [ ] Task: Replace Old Page Content
    - Update `src/app/vortex/page.tsx` to use the new `VortexContainer` instead of the separate `VortexHero` and `VortexManifesto`.
- [ ] Task: Final Polish & Performance Check
    - Verify `will-change` properties.
    - Ensure `ctx.revert()` is cleaning up correctly.
    - Check for layout thrashing.
- [ ] Task: Conductor - User Manual Verification 'Integration & Cleanup' (Protocol in workflow.md)
