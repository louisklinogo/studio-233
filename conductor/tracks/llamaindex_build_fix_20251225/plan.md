# Plan: Fix LlamaIndex Build Errors and Introduce `packages/rag`

This plan addresses build failures and architectural bloat by creating a dedicated `@studio233/rag` package to isolate LlamaIndex and data ingestion logic.

## Phase 1: Correct Package Exports [x]
Goal: Fix monorepo module resolution for database utilities.

- [x] Task: Update `packages/db/package.json` to explicitly export `./vector-search`.
- [x] Task: Verify `@studio233/db/vector-search` can be resolved by other packages.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Correct Package Exports' (Protocol in workflow.md)

## Phase 2: Scaffold `packages/rag` [x]
Goal: Create the foundation for the knowledge processing package.

- [x] Task: Initialize `packages/rag` with a proper `package.json` and `tsconfig.json`.
- [x] Task: Move `llamaindex`, `@llamaindex/google`, and `@llamaindex/readers` dependencies from `packages/ai` and `apps/web` into `packages/rag`.
- [x] Task: Export a basic "Health Check" or "Init" function from `@studio233/rag`.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Scaffold packages/rag' (Protocol in workflow.md)

## Phase 3: Migrate Knowledge Logic [x]
Goal: Relocate RAG logic to the new package.

- [x] Task: Move `initLlamaIndex` and any LlamaIndex utilities from `packages/ai/src/utils/llama-index.ts` to `packages/rag`.
- [x] Task: Create a `brandIngestionService` in `@studio233/rag` that handles the PDF-to-Vector process (logic currently in `apps/web/src/inngest/functions/brand-ingestion.ts`).
- [x] Task: Create a `retrievalService` in `@studio233/rag` for similarity searching.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Migrate Knowledge Logic' (Protocol in workflow.md)

## Phase 4: Refactor Integration Points [x]
Goal: Update AI tools and Inngest functions to use the new package.

- [x] Task: Update `packages/ai/src/tools/brand.ts` to use `@studio233/rag`'s `retrievalService`.
- [x] Task: Update `apps/web/src/inngest/functions/brand-ingestion.ts` to use `@studio233/rag`'s `brandIngestionService`.
- [x] Task: Cleanup unused imports and dependencies in `packages/ai` and `apps/web`.
- [x] Task: Conductor - User Manual Verification 'Phase 4: Refactor Integration Points' (Protocol in workflow.md)

## Phase 5: Build Verification and Final Integration [/]
Goal: Ensure monorepo-wide build stability.

- [x] Task: Run `bun run build` at the monorepo root.
- [x] Task: Perform a manual verification of the Brand Archive ingestion flow.
- [x] Task: Conductor - User Manual Verification 'Phase 5: Build Verification and Final Integration' (Protocol in workflow.md)