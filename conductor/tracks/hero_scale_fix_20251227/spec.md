# Track Specification: Vortex Hero Scale Fix

## 1. Overview
**Goal:** Fix the pixelation/blur issue that occurs when the central "+" symbol in the Vortex Hero section is scaled up 150x during the scroll-triggered animation.
**Problem:** Currently, the `+` is a text character (`<span>+</span>`). Browsers rasterize this text at its initial small size. When scaled 150x by GSAP, the browser simply stretches the low-res bitmap, resulting in a blocky, pixelated appearance, especially during the reverse animation (scrolling back up).
**Solution:** Replace the text-based "+" with a resolution-independent SVG vector graphic. This ensures infinite scalability without quality loss.

## 2. Functional Requirements
1.  **Replace Text with SVG:**
    *   Locate the `VortexHeroV2.tsx` component.
    *   Remove the `<span>+</span>` element.
    *   Insert a custom, inline `<svg>` element in its place.
    *   The SVG must visually match the current design (Orange `#FF4400`, thick "Black" font weight stroke/fill).
    *   The SVG must use `shape-rendering: geometricPrecision` to ensure sharp edges at high scale.

2.  **Maintain Animation Behavior:**
    *   Ensure the `plusRef` is correctly attached to this new SVG element.
    *   The GSAP animation in `VortexContainer.tsx` (rotation 90deg, scale 150) must continue to work exactly as before, targeting the new SVG.

3.  **Performance Tuning:**
    *   Ensure `will-change: transform` is preserved or correctly applied to the new SVG to hint the browser.
    *   Verify `force3D: true` is active (explicitly or implicitly) in the GSAP tween to leverage GPU acceleration.

## 3. Non-Functional Requirements
*   **Visual Consistency:** The new SVG `+` must look nearly identical to the previous text version at resting state (scale 1).
*   **Performance:** The animation must run at 60fps without causing layout thrashing (Reflow/Repaint) during the scale operation.
*   **Code Style:** Use Tailwind classes for coloring and sizing where appropriate, consistent with the existing codebase.

## 4. Acceptance Criteria
*   [ ] The "+" symbol looks identical to the original text version at the initial state (scroll top).
*   [ ] When scrolling down, the `+` scales up 150x and rotates 90deg.
*   [ ] **Crucial:** When the `+` is fully scaled (or scaling), the edges are crisp and sharp, NOT pixelated.
*   [ ] When scrolling back UP (reversing the animation), the `+` remains sharp throughout the transition.
*   [ ] No console errors or layout shifts introduced.

## 5. Out of Scope
*   Moving the animation to Canvas/WebGL (decided against in favor of DOM SVG).
*   Changing the animation timing or scroll triggers.
*   Refactoring the entire `VortexContainer` logic beyond this specific fix.
