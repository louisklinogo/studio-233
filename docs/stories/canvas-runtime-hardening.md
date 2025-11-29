# Story: Canvas Runtime Hardening & Performance Optimizations

## Context
- The `apps/web/src/app/canvas/[id]/page.tsx` route was synchronously `use`-ing the `params` object, tripping Next.js’s "uncached data outside `<Suspense>`" warning and blocking the page render.
- The `OverlayInterface` client surface has grown into a monolith that eagerly registers every dialog, floating control, and streaming hook up front, which inflates the JS payload and hurts interactivity.
- Canvas state hooks (`useCanvasState`, `useInteractionState`, `useUIState`) now juggle hundreds of fields; every paint triggers wide re-renders because the state is shared across unrelated UI slices.

## Goals
1. Keep the `/canvas/[id]` route non-blocking by validating params on the server without `use()` and by loading any project metadata inside proper `async` boundaries / Suspense.
2. Decrease the amount of JS the canvas client must hydrate on first paint by lazily importing heavyweight, low-frequency panels (chat history, dialogs, video generators, etc.).
3. Isolate state domains so changes to images/videos don’t re-render command bars, dialogs, or streaming indicators unnecessarily.

## Required Work
1. **Route hygiene & data orchestration**
   - Keep `params` synchronous (`{ params: { id } }`).
   - When the route needs project metadata, fetch it via an `async` server component or nested `Suspense` boundary (e.g., `const project = await getProject(id)` inside the server component, wrapped in `<Suspense fallback={...}>`).
   - Ensure any blocking `await` happens before returning client components.

2. **Lazy-load rarely used UI**
   - Convert modules such as `DialogManager`, `ImageGeneratorPanel`, `ChatPanel`, and video generation dialogs into dynamic imports with `next/dynamic` and `ssr: false`, rendering fallback skeletons.
   - Gate the load behind obvious triggers (e.g., when chat opens, when “Generate Video” is clicked) so the main canvas controls hydrate faster.

3. **State domain separation**
   - Split `useCanvasState` into focused stores (e.g., `useCanvasElementsState`, `useSelectionState`, `useHistoryState`).
   - Memoize derived data (like `canvasElements` projections) and pass only per-domain setters down the tree to minimize prop churn.
   - Convert frequently updated sets (`hiddenVideoControlsIds`, `visibleIndicators`) into context providers scoped to the components that actually consume them, rather than keeping them in the root hook.

## Definition of Done
- `/canvas/[id]` no longer logs "Blocking Route" warnings under Next.js 16.
- LCP/TTI regressions decrease (confirm via Next dev overlay or profiling) thanks to dynamic imports of heavy panels.
- Canvas interactions (dragging, selection, history) no longer trigger React profiler warnings about cascading renders because state updates stay within their own providers.
