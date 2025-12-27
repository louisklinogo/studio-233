# Implementation Plan: Vortex Hero Scale Fix

Fixing the pixelation issue of the Hero "+" symbol by migrating from text-based rendering to resolution-independent SVG.

## Phase 1: Preparation and Environment Check [checkpoint: c260162]
- [x] Task: Verify the current behavior and reproduce the pixelation issue (Mental check/Manual confirmation).
- [x] Task: Research the exact dimensions/style of the current `+` character in `VortexHeroV2.tsx` (Inter/Helvetica Black).
- [x] Task: Conductor - User Manual Verification 'Preparation' (Protocol in workflow.md) c260162

## Phase 2: SVG Implementation [ ]
- [x] Task: Design the custom geometric SVG `+` path.
- [x] Task: Replace the `<span>+</span>` in `apps/web/src/components/landing/VortexHeroV2.tsx` with the new `<svg>`.
- [x] Task: Ensure `plusRef` is correctly bound to the SVG element.
- [x] Task: Apply `shape-rendering="geometricPrecision"` and appropriate Tailwind classes (`text-[#FF4400]`, `will-change-transform`).
- [ ] Task: Conductor - User Manual Verification 'SVG Implementation' (Protocol in workflow.md)

## Phase 3: Animation Hardening [ ]
- [ ] Task: Update the GSAP timeline in `apps/web/src/components/landing/VortexContainer.tsx`.
- [ ] Task: Verify the `fromTo` tween targets the SVG correctly.
- [ ] Task: (Optional) Explicitly add `force3D: true` to the tween if jitter is observed during manual testing.
- [ ] Task: Conductor - User Manual Verification 'Animation Hardening' (Protocol in workflow.md)

## Phase 4: Final Verification [ ]
- [ ] Task: Write/Update a unit test to ensure the `VortexHeroV2` component renders the SVG and maintains the `plusRef` interface.
- [ ] Task: Verify sharpness at 150x scale across different zoom levels in the browser.
- [ ] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)
