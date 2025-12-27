# Plan: Migrate Inngest to Dedicated Package (@studio233/inngest)

This plan outlines the refactoring of Inngest logic into a shared package within the monorepo.

## Phase 1: Scaffolding & Core Infrastructure [checkpoint: fbfef26]
Establish the new package and its base configuration.

- [x] Task 1.1: Create `packages/inngest` directory structure (src/events, src/functions). a814320
- [x] Task 1.2: Configure `package.json`, `tsconfig.json`, and `index.ts` for `@studio233/inngest`. a814320
- [x] Task 1.3: Initialize the Inngest client in `packages/inngest/src/client.ts`. a814320
- [x] Task: Conductor - User Manual Verification 'Scaffolding & Core Infrastructure' (Protocol in workflow.md) fbfef26

## Phase 2: Schema & Type Migration [checkpoint: fbfef26]
Move event definitions to the shared package to enable type-safe triggering across apps.

- [x] Task 2.1: Write a unit test in `packages/inngest` to verify schema validation for core events. a814320
- [x] Task 2.2: Port Zod event schemas from `apps/web/src/inngest/events.ts` to `packages/inngest/src/events`. a814320
- [x] Task 2.3: Export event constants and types from the package. a814320
- [x] Task: Conductor - User Manual Verification 'Schema & Type Migration' (Protocol in workflow.md) fbfef26

## Phase 3: Function Porting [checkpoint: ]
Move the background job logic into the package.

- [ ] Task 3.1: Port `brand-ingestion.ts` and its dependencies to `packages/inngest/src/functions`.
- [ ] Task 3.2: Port `archive-vision-result.ts` and `process-workflow-run.ts`.
- [ ] Task 3.3: Port `studio/process-workflow.ts` (the most complex function).
- [ ] Task 3.4: Resolve all cross-package imports (@studio233/db, ai, rag) in the new location.
- [ ] Task: Conductor - User Manual Verification 'Function Porting' (Protocol in workflow.md)

## Phase 4: Integration & Cleanup [checkpoint: ]
Wire the web app to the new package and remove the legacy code.

- [ ] Task 4.1: Update `apps/web/src/app/api/inngest/route.ts` to import handlers and client from `@studio233/inngest`.
- [ ] Task 4.2: Refactor `apps/web` call sites (TRPC routers and Server Actions) to use the shared package.
- [ ] Task 4.3: Remove the `apps/web/src/inngest` directory.
- [ ] Task 4.4: Verify the full build (`bun run build`) and perform a manual end-to-end smoke test.
- [ ] Task: Conductor - User Manual Verification 'Integration & Cleanup' (Protocol in workflow.md)
