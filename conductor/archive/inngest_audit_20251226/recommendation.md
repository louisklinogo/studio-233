# Inngest Architectural Advisory: Dedicated Package Migration

## 1. Executive Summary
**Recommendation: GO.** 
After a thorough audit of the current Inngest implementation, it is highly recommended to migrate Inngest logic into a dedicated `@studio233/inngest` package. The current setup is functional but tightly coupled with `apps/web`, which will hinder scalability and cross-app event sharing as the monorepo evolves.

## 2. Current State Analysis
- **Location:** All logic resides in `apps/web/src/inngest`.
- **Functions:** 5 identified functions (3 currently served).
- **Events:** Defined locally in `apps/web/src/inngest/events.ts`.
- **Dependencies:** Deeply integrated with `@studio233/ai`, `@studio233/db`, and `@studio233/rag`.
- **Trigger Points:** Spread across TRPC routers, Server Actions, and API routes in `apps/web`.

## 3. Rationale for Migration
### 3.1 Type-Safety & Event Sharing
By moving event schemas (Zod) to a shared package, we ensure that any app or package in the monorepo can trigger events with full type-safety without importing from `apps/web`.

### 3.2 Separation of Concerns
Background job logic is fundamentally different from UI/API logic. Moving it to a package allows for:
- Independent testing (using `inngest-test` helpers).
- Cleaner dependency graphs.
- Potential for a dedicated "Worker" deployment if needed.

### 3.3 Circular Dependency Management
A dedicated package provides a clear boundary. We must ensure `packages/ai` doesn't directly import from `packages/inngest` to avoid circularity (since Inngest functions will likely import from AI). The "Context-Passing" pattern already used in `packages/ai/src/tools/vision.ts` should be formalized.

## 4. Proposed Architecture
### 4.1 File Structure
```text
packages/inngest/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts        # Main entry point (exports client, events, helper types)
│   ├── client.ts       # Inngest client initialization
│   ├── events/         # Event schema definitions (Zod)
│   │   ├── index.ts
│   │   ├── studio.ts
│   │   └── brand.ts
│   ├── functions/      # The actual background job logic
│   │   ├── index.ts    # Exports all functions as an array
│   │   ├── studio/
│   │   └── brand/
│   └── middleware/     # Shared Inngest middleware (logging, error reporting)
```

### 4.2 Integration Plan
1. **Create Package:** Scaffold `@studio233/inngest`.
2. **Move Schemas:** Port Zod schemas from `apps/web/src/inngest/events.ts`.
3. **Move Functions:** Port function logic, updating imports to use the new shared package.
4. **Update App:** Change `apps/web/src/app/api/inngest/route.ts` to import the `serve` configuration from the new package.
5. **Update Producers:** Update TRPC and Server Actions to import the `inngest` client from the shared package.

## 5. Decision
**Status: GO**
The benefits of maintainability, type-safety, and future-proofing far outweigh the migration overhead.
