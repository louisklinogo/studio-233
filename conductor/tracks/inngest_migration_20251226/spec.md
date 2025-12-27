# Specification: Migrate Inngest to Dedicated Package (@studio233/inngest)

## Overview
This track executes the architectural recommendation to migrate all Inngest-related logic (client, schemas, functions) from `apps/web/src/inngest` to a new dedicated workspace package `@studio233/inngest`. This move decouples background job logic from the Next.js frontend, enabling better scalability, type sharing, and independent testing.

## Goals & Objectives
- **Centralize Infrastructure:** Establish `@studio233/inngest` as the single source of truth for background jobs.
- **Decouple Dependencies:** Remove direct Inngest logic from `apps/web`, leaving only the API route handler.
- **Ensure Type Safety:** seamless sharing of event types across the monorepo (e.g., for TRPC routers triggering events).
- **Maintain Parity:** Achieve a strict 1-to-1 port of existing functionality with zero regression in business logic.

## Functional Requirements
1.  **Package Scaffolding:** Create `packages/inngest` with proper `package.json`, `tsconfig.json`, and exports.
2.  **Schema Migration:** Move all Zod event schemas from `apps/web/src/inngest/events.ts` to `packages/inngest/src/events`.
3.  **Client Migration:** Move the Inngest client initialization to `packages/inngest/src/client.ts`.
4.  **Function Migration:** Move all function definitions (Studio Workflow, Brand Ingestion, etc.) to `packages/inngest/src/functions`.
5.  **App Integration:** Update `apps/web/src/app/api/inngest/route.ts` to serve functions imported from the new package.
6.  **Producer Updates:** Update all call sites (TRPC, Server Actions) to import `inngest` and event schemas from `@studio233/inngest`.

## Non-Functional Requirements
- **Zero Downtime:** The migration should not break the ability to process existing jobs (though a redeploy will be needed).
- **Developer Experience:** The `dev` command must still start the Inngest dev server and recognize the functions.
- **Code Quality:** All moved code must pass linting and type-checking.

## Acceptance Criteria
- [ ] `packages/inngest` exists and builds successfully.
- [ ] `apps/web` no longer contains `src/inngest` (except potentially for the API route file itself).
- [ ] `bun run build` passes for the entire monorepo.
- [ ] The Inngest Dev Server correctly lists all migrated functions.
- [ ] A manual end-to-end test of "Brand Ingestion" or "Studio Workflow" succeeds.

## Out of Scope
- Adding new Inngest functions.
- Changing the internal logic of existing functions (strictly refactor/move).
- Setting up a separate worker service (we will still serve from Next.js for now, just importing from the package).
