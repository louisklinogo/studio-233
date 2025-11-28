# Story: AI SDK Migration – Validation & App Hardening

## Context
- The Mastra runtime has been replaced with a bespoke AI SDK runtime (shared prompts, tool registry, Google providers) and all Mastra dependencies were removed across the repo.
- `packages/ai` now builds independently, but `apps/web` still contains legacy hooks and components that assumed Mastra responses and older TRPC typings.
- `bunx turbo run check-types --filter=web` currently fails, and `bun install` still aborts because the optional `canvas@2.11.2` dependency cannot build on Windows.

## Goals
1. Finish the AI SDK migration by making the web app compile cleanly against the new runtime.
2. Stabilize dependency installation so local bootstrap does not error out on optional packages.
3. Document and enforce a validator gate (`check-types`, lint, targeted tests) before future commits touching agents or studio UI.

## Required Work
1. **Canvas Text-to-Image plumbing**
   - Update `TextToImageParams` / `TextToImageResult` consumers (`apps/web/src/app/canvas/page.tsx`, `OverlayInterface`, `page.backup.tsx`) so their mutation hooks accept the new typed shape (replace plain `string` `imageSize` with the strict union, propagate prompt/model metadata, remove unused args).
   - Fix optimistic canvas updates to use the new `CanvasCommand.meta.provider` (string) and non-optional tool call IDs.

2. **Video overlay + tool usage**
   - Pass `viewport`/`hiddenVideoControlsIds` into `VideoOverlays` in both canvas screens.
   - Remove obsolete helper invocations that now expect a single config argument.

3. **Auth flow client hooks**
   - `LoginFormReceipt` and `LoginFormSignal` still pass `fetchOptions` into Better Auth helpers that no longer accept it; update to the latest API and type `ctx`.

4. **Dashboard mutations**
   - Reconcile the TRPC mutation generics so `useMutation` receives a single `UseMutationOptions` object; ensure `onMutate` callbacks return `void` and derive a typed context for `onSettled`.

5. **Chat + UI polish**
   - Normalize `onCanvasCommand` helper code so placeholder commands cast through `as CanvasCommand` safely (or broaden the union provider type) and guard `toolCallId` before using it in Set keys.
   - Update `BraunButton` to either drop `onDrag` or wrap it with `motion.button`’s expected signature (`MouseEvent | TouchEvent | PointerEvent`).

6. **Tool registry typings**
   - Finish strongly typing the AI SDK `tool()` wrapper so TypeScript no longer infers `never` for `inputSchema`; confirm no `as any` casts remain once app types compile.

7. **Bun install ergonomics**
   - Decide on a strategy for the optional `canvas` dependency (guarded install script, prebuilt binary, or documented manual step) so `bun install` exits 0 on Windows.

## Definition of Done
- `bun install` completes without fatal “Failed to install 1 package” errors on contributor machines.
- `bunx turbo run check-types --filter=web` passes.
- Studio canvas/chat flows render without TypeScript casts or runtime warnings tied to the new agent runtime.
