# Studio+233 – Canvas & Mastra AI Integration TODOs

This file tracks follow‑up work for the canvas ⇄ Mastra ⇄ AI SDK architecture. It assumes the current state of the repo as of integrating `canvasTextToImageTool` and `/api/chat` streaming.

## 1. Thread RuntimeContext into `/api/chat` and tools

- **Goal:** Make canvas context (selected image IDs, project info, etc.) available to agents/tools via Mastra’s `RuntimeContext`, not just ad‑hoc request bodies.
- **Current state:**
  - `apps/web/src/components/studio/chat/ChatPanel.tsx` sends:
    - `canvas: { selectedImageIds }` in the body via `prepareSendMessagesRequest`.
  - `apps/web/src/app/api/chat/route.ts` currently does:
    - `const { messages, canvas } = await req.json();`
    - `const agentStream = await agent.stream(messages, { /* no runtimeContext yet */ });`
  - Tools/agents do **not** read from `runtimeContext` yet.
- **Tasks:**
  1. Create a `RuntimeContext` in `/api/chat/route.ts`:
     - `import { RuntimeContext } from "@mastra/core/runtime-context";`
     - `const runtimeContext = new RuntimeContext();`
     - If `canvas?.selectedImageIds` exists, `runtimeContext.set("selectedImageIds", canvas.selectedImageIds);`
     - Call `agent.stream(messages, { runtimeContext });`.
  2. Decide on a stable key schema for canvas context, e.g.:
     - `selectedImageIds: string[]`
     - `projectId?: string`
     - `selectionSummary?: { count: number; types: Array<"image" | "video"> }`
  3. Update at least one tool (see section 2) to **read** from `runtimeContext` and verify end‑to‑end behavior.

## 2. Canvas edit tools that consume selection

- **Goal:** Let chat‑driven tools operate on **existing** canvas images/videos (edits), not only generate new ones.
- **Current building blocks:**
  - IndexedDB‑backed storage in `apps/web/src/lib/storage.ts` for images/videos.
  - Canvas state types in `@studio233/canvas` (`PlacedImage`, `PlacedVideo`, `HistoryState`).
  - Mastra workflows in `@studio233/ai`:
    - `background-removal.ts`, `object-isolation.ts`, `vision-enhancements.ts`, `video.ts`, etc.
  - Web‑side handlers already know how to:
    - Run background removal, isolate object, Gemini edits.
    - Add new `PlacedImage`s to the canvas and position them.
- **Tasks:**
  1. Define additional `CanvasCommand` variants in `packages/ai/src/types/canvas.ts`, e.g.:
     - `update-image` (replace content in place by `targetId`).
     - Possibly `add-image-next-to` with `originalImageId` for “variant next to original”.
  2. Create tools in `packages/ai/src/tools/canvas.ts`, wrapping existing workflows:
     - `canvasEditImageTool` (Gemini edit):
       - Input: `{ imageId?: string; prompt: string; apiKey?: string }`.
       - Resolve `imageId` → URL using either `runtimeContext` data or a backend asset store.
       - Run the appropriate workflow (`generateImageFromTextWithFallback`-style) and emit `CanvasCommand` (`add-image` or `update-image`).
     - `canvasBackgroundRemovalTool` and/or `canvasObjectIsolationTool` that wrap the existing background‑removal/object‑isolation workflows and stream `data-canvas-command` parts.
  3. Register these tools on `orchestratorAgent` (and/or `visionForgeAgent`) so the LLM can call them.
  4. Extend the frontend `handleCanvasCommand` in `apps/web/src/app/canvas/page.tsx` to handle new command types safely (missing `targetId`, deleted elements, etc.).

## 3. Asset identification and persistence

- **Goal:** Make server‑side tools able to reliably reference canvas assets by **ID**, not just transient URLs from the client.
- **Current state:**
  - `CanvasStorage` (`apps/web/src/lib/storage.ts`) stores `images` and `videos` in IndexedDB with IDs and `originalDataUrl`.
  - Canvas state uses `PlacedImage.id` / `PlacedVideo.id` for layout and selection, but there is no server‑side asset table; server tools currently have no first‑class notion of `imageId`.
- **Tasks (longer‑term):**
  1. Introduce a simple backend asset model (e.g. in `@studio233/db`):
     - `CanvasAsset { id, projectId, url, kind: "image" | "video", meta }`.
  2. When uploading or generating images/videos, write a `CanvasAsset` row and use that `id` as the canonical `imageId`/`videoId` shared between client and server.
  3. Update canvas state (`PlacedImage`, `CanvasElement`) to optionally carry `assetId` alongside `src`.
  4. Update canvas tools (section 2) to resolve `imageId` → `url` via this backend asset store instead of relying solely on runtime `src` from the client.

## 4. Chat UX and error surfacing

- **Goal:** Make streaming and error behavior production‑grade from a UX perspective.
- **Current state:**
  - `ChatPanel` logs errors from `useChat` to `console.error` only.
  - `/api/chat` returns generic 500 JSON on exceptions; AI SDK UI exposes an `error` state but the UI doesn’t yet render a visible banner/toast.
- **Tasks:**
  1. Add user‑visible error feedback in `ChatPanel` when `status === "error"` or `error` is set (e.g. a small banner “Something went wrong while talking to the agent”).
  2. Consider mapping common tool/provider errors to friendlier, localized messages (rate limits, missing API keys, enterprise‑only models, etc.).
  3. Optionally log structured errors and tool results via Mastra observability (AI Tracing/OTEL) for better monitoring.

## 5. Type safety and refactors (existing issues)

- **Goal:** Reduce noise in `bun run check-types` so new AI/canvas work is easier to validate.
- **Current state:** existing TS errors unrelated to this AI/canvas integration (e.g. `ai-actions.ts`, `api/ai/[agent]/route.ts`, `ProjectCard`, `BraunButton`, some `packages/ai` workflow configs, missing `@types/react-dom`).
- **Tasks:**
  1. Fix or suppress existing type errors in:
     - `apps/web/src/app/actions/ai-actions.ts`.
     - `apps/web/src/app/api/ai/[agent]/route.ts`.
     - `apps/web/src/components/dashboard/ProjectCard.tsx`.
     - `apps/web/src/components/ui/operator/BraunButton.tsx`.
     - `packages/ai/src/tools/batch.ts`, `packages/ai/src/utils/run-workflow.ts`.
     - `packages/ai/src/workflows/layout.ts`, `packages/ai/src/workflows/vision-enhancements.ts`.
  2. Add `@types/react-dom` as a dev dependency in `apps/web` (or declare module), to remove the implicit `any` on `react-dom`.

---

This TODO focuses only on the Mastra ⇄ AI SDK ⇄ canvas architecture and related robustness concerns. Other product work (UI polish, new tools/workflows, auth, etc.) should be tracked separately.



   4. Keep StudioBar logic truly retired

   Right now we’ve removed StudioBar from the canvas HUD, but some of its concerns migrated into `OverlayInterface` (keyboard shortcuts, context-ish logic). Long‑term, I’d:

   •  Treat OverlayInterface as an orchestrator, and:
     •  Push generic keyboard logic into useCanvasHotkeys.
     •  Keep only wiring/layout and high‑level orchestration in OverlayInterface.
   •  Optionally, when you’re happy with ChatBar, delete unused StudioBar/StudioBarInput/StudioPromptDialog to avoid future confusion (or mark them as deprecated clearly).
