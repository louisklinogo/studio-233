# Specification: Fix LlamaIndex Build Errors and Introduce `packages/rag`

## Overview
The current build process for `apps/web` is failing due to module resolution issues with `llamaindex`. Furthermore, the current architecture mixes lightweight AI orchestration with heavy knowledge ingestion and retrieval logic in `packages/ai`. This track aims to resolve build blockers and improve the monorepo architecture by introducing a dedicated `packages/rag` package.

## Functional Requirements
1.  **Create `packages/rag`:** Scaffold a new package to house all Retrieval-Augmented Generation (RAG) logic, including LlamaIndex, PDF parsing, and vector search coordination.
2.  **Encapsulate Ingestion Logic:** Move the `brand-ingestion.ts` core logic and its heavy dependencies (`llamaindex`, `@llamaindex/readers`, `@llamaindex/google`) from `apps/web` and `packages/ai` into `@studio233/rag`.
3.  **Refactor AI Tools:** Update the `consultBrandGuidelines` tool in `packages/ai` to consume retrieval services from `@studio233/rag` rather than using LlamaIndex directly.
4.  **Refactor Inngest Functions:** Update the web app's Inngest functions to delegate the heavy lifting to the new `@studio233/rag` package.
5.  **Update DB Exports:** Ensure `@studio233/db/vector-search` is correctly exported for use by `packages/rag`.

## Non-Functional Requirements
- **Build Stability:** `bun run build` must pass monorepo-wide.
- **Architectural Integrity:** `packages/ai` remains a lightweight "Brain" (Edge-compatible where possible), while `packages/rag` handles heavy, Node-dependent data processing.
- **Dependency Isolation:** `apps/web` should only depend on `@studio233/rag` and `@studio233/ai` high-level interfaces.

## Acceptance Criteria
- [ ] Turborepo build (`turbo build`) completes without errors.
- [ ] `packages/rag` exists and encapsulates all LlamaIndex dependencies.
- [ ] `packages/ai` has no direct dependency on `llamaindex` packages.
- [ ] The Brand Archive ingestion flow functions as expected using the new cross-package architecture.

## Out of Scope
- Adding new RAG features or modifying the vector search logic itself.
- Schema changes or database migrations.