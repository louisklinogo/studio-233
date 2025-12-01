# Story: Canvas Overlay Interface Modularization

## Context
- `apps/web/src/components/canvas/OverlayInterface.tsx` has grown into a monolithic client surface that wires up all canvas state hooks, handlers, dialogs, streaming layers, HUD overlays, and toolbars in a single file.
- This size makes it hard to understand, risky to change, and easy to accidentally regress cross-cutting concerns like selection, video, or isolate flows.
- We recently standardized `/canvas` to delegate to `OverlayInterface` (via `/canvas/[id]` and the `scratch` project), so this component is now the canonical canvas shell.

## Goals
1. Reduce the size and cognitive load of `OverlayInterface` while preserving existing behavior.
2. Separate orchestration logic (state, handlers, side effects) from presentational layout (JSX).
3. Make it easy to evolve individual canvas areas (viewport, HUD, toolbars, dialogs, streaming) without touching the entire file.

## Required Work

- [ ] **Phase 1 – Extract `useCanvasShell(projectId)` hook**
  - [ ] Create `useCanvasShell.ts` alongside `OverlayInterface.tsx`.
  - [ ] Move composition of existing hooks (`useCalibration`, `useUIState`, `useCanvasState`, `useInteractionState`, `useViewportState`, `useVideoGeneration`, `useFalClient`, `useTRPC`, storage helpers) into `useCanvasShell(projectId)`.
  - [ ] Define a structured `CanvasShellState` and `CanvasShellHandlers` interface, grouping concerns by domain (ui, canvas, viewport, generation, video, isolate, calibration, misc).
  - [ ] Move callback logic and effects (e.g. `handleRun`, `handleDrop`, `handleFileUpload`, `handleCanvasCommand`, isolate/video handlers, calibration completion) into `useCanvasShell`.
  - [ ] Update `OverlayInterface` to replace individual hook calls with `const { state, handlers } = useCanvasShell(projectId);`.

- [ ] **Phase 2 – Introduce `CanvasShellView` and top-level layout split**
  - [ ] Add `CanvasShellView.tsx` that takes `{ state, handlers, projectId }` and renders the high-level structure (calibration `AnimatePresence` + layout container).
  - [ ] Move existing JSX from `OverlayInterface` into `CanvasShellView` without changing behavior, continuing to pass through `state`/`handlers`.
  - [ ] Wire `OverlayInterface` to render `<CanvasShellView state={state} handlers={handlers} projectId={projectId} />`.

- [ ] **Phase 3 – Extract focused presentational subviews**
  - [ ] Create `CanvasMainViewport.tsx` to own the `<main>` region, gradients, `CanvasStage`, and context-menu logic.
  - [ ] Create `CanvasHudOverlays.tsx` for HUD elements (e.g. `CanvasTitleBlock` where applicable, mobile Fal logo, `MiniMap`, `GithubBadge`, `DimensionDisplay`).
  - [ ] Create `CanvasToolbars.tsx` for tool surfaces (`CanvasPalette`, `ToolPropertiesBar` where used, `ContextToolbar`, `StudioBar`, `ChatTrigger`).
  - [ ] Create `CanvasDialogsAndStreaming.tsx` for dialogs and streaming layers (`ImageGeneratorPanel`, `DialogManager`, `StreamingImage`/`StreamingVideo` maps, `VideoOverlays`, `ChatPanel`, `ZoomControls`).
  - [ ] Update `CanvasShellView` to delegate to these subviews, passing in only the slices of `state`/`handlers` they need.

- [ ] **Phase 4 – Type tightening and internal hook decomposition (optional)**
  - [ ] Move `CanvasShellState` / `CanvasShellHandlers` into a shared `canvasShellTypes.ts` in the same folder.
  - [ ] Inside `useCanvasShell`, optionally decompose into internal hooks such as `useCanvasGeneration`, `useCanvasVideo`, `useCanvasIsolate`, and compose them, keeping them internal to the canvas module.
  - [ ] Extract small reusable pieces (e.g. `StreamingImageLayer`, `StreamingVideoLayer`, `CanvasGradientsOverlay`, `useCanvasHotkeys`) only after the main split is stable.

## Definition of Done
- [ ] `OverlayInterface.tsx` contains only a thin orchestration layer (call to `useCanvasShell`, render of `CanvasShellView`) and minimal glue logic.
- [ ] `useCanvasShell` encapsulates all state and handlers previously defined in `OverlayInterface`, with clear domain groupings.
- [ ] Canvas behavior at `/canvas` and `/canvas/[id]` remains unchanged in manual smoke tests (selection, dragging, isolate flows, video flows, dialogs, chat, generation).
- [ ] `bun lint` passes after each phase, and there are no new React/Next.js runtime warnings attributable to the refactor.
