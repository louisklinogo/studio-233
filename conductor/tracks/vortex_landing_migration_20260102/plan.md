# Implementation Plan: Vortex Landing Migration & Login Overhaul

This plan outlines the migration of the Vortex sequence to the root landing page, the integration of the Infinite Tunnel transport layer, and the "Physical Transaction" overhaul of the login gateway.

## Phase 1: Routing & Scaffolding
- [x] Task: Backup existing landing page and migrate Vortex to root [10c583f]
    - [x] Write Tests: Verify root route renders VortexPage components
    - [x] Implement: Move `apps/web/src/app/vortex/page.tsx` to `apps/web/src/app/page.tsx` (renaming old page to `archive/page.tsx`)
- [x] Task: Locomotive Scroll Integration [8c59bff]
    - [x] Write Tests: Verify Locomotive Scroll instance initialization
    - [x] Implement: Integrate Locomotive Scroll v5 as the primary scroll engine in `VortexContainer`
- [ ] Task: Conductor - User Manual Verification 'Routing & Scaffolding' (Protocol in workflow.md)

## Phase 2: System Handshake (The New Boot)
- [x] Task: Schematic Assembly Animation [4665d95]
    - [x] Write Tests: Verify GSAP timeline execution for boot assembly
    - [x] Implement: Create "Calibration Sequence" in `BootSequence.tsx` that draws the Hero grid and core
- [x] Task: Telemetry & Scramble Integration [4665d95]
    - [x] Write Tests: Verify ScrambleText triggers during boot phases
    - [x] Implement: Add system-readiness telemetry logs using ScrambleText during the schematic build
- [ ] Task: Conductor - User Manual Verification 'System Handshake' (Protocol in workflow.md)

## Phase 3: Spatial Handover (The Tunnel Transport)
- [x] Task: Infinite Archive Integration [f59b2ff]
    - [x] Write Tests: Verify Three.js scene mounting within `VortexContainer`
    - [x] Implement: Insert `InfiniteArchive` as Act IV in the `VortexContainer` timeline
- [x] Task: Kinetic Scroll Locking [f59b2ff]
    - [x] Write Tests: Verify camera Z-depth sync with Locomotive scroll progress
    - [x] Implement: Bind Three.js camera and tunnel progress to the `ScrollTrigger` progress in `VortexContainer`
- [ ] Task: Conductor - User Manual Verification 'Spatial Handover' (Protocol in workflow.md)

## Phase 4: Authentication Gateway Overhaul
- [x] Task: Braun Handshake Switch [ed55e30]
    - [x] Write Tests: Verify state change and animation trigger on skeuomorphic toggle
    - [x] Implement: Create the physical sliding switch component for auth mode selection
- [x] Task: Thermal Printer Protocol [ed55e30]
    - [x] Write Tests: Verify `clip-path` animation during receipt generation
    - [x] Implement: Animate the receipt "feeding" out of the UI slit using GSAP and CSS clip-path
- [x] Task: HUD & Layout Continuity [ed55e30]
    - [x] Write Tests: Verify `SystemHUD` presence on the login page
    - [x] Implement: Inject `SystemHUD` and `GlitchHeader` into `LoginPageView` for system-wide continuity
- [ ] Task: Conductor - User Manual Verification 'Authentication Gateway Overhaul' (Protocol in workflow.md)

## Phase 5: Performance & Memory Integrity
- [ ] Task: Asset Lifecycle Management
    - [ ] Write Tests: Verify Three.js `.dispose()` calls on component unmount/transition
    - [ ] Implement: Implement explicit memory cleanup for the Tunnel and Canvas layers
- [ ] Task: Mobile Performance Optimization
    - [ ] Write Tests: Verify frame rate stability on simulated mobile viewport
    - [ ] Implement: Cap pixel ratios and optimize shader uniforms for mobile performance
- [ ] Task: Conductor - User Manual Verification 'Performance & Memory Integrity' (Protocol in workflow.md)
