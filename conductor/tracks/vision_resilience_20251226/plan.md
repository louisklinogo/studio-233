# Implementation Plan: Vision Analysis Resilience & Async Archival

#### Phase 1: Inngest Schema & Event Definition [checkpoint: 7dc039e]
- [x] **Task 1.1: Define Inngest Event Schema** - Add `vision.archive.requested` schema to `apps/web/src/inngest/events.ts` (dc4d749)
- [x] **Task 1.2: Register Event in Client** - Update `EventMap` in `apps/web/src/inngest/client.ts` to include the new event (2ec2a54)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Inngest Schema & Event Definition' (Protocol in workflow.md) (7dc039e)

#### Phase 2: Asynchronous Archival Function
- [ ] **Task 2.1: Implement Archive Function** - Create `apps/web/src/inngest/functions/archive-vision-result.ts` to handle the download/upload logic.
- [ ] **Task 2.2: Register Function** - Ensure the new function is registered in the Inngest handler (likely `apps/web/src/app/api/inngest/route.ts`).
- [ ] **Task 2.3: Red/Green TDD** - Write a test for the archival logic and implement to pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Asynchronous Archival Function' (Protocol in workflow.md)

#### Phase 3: Workflow Hardening
- [ ] **Task 3.1: Refactor Vision Workflow** - Update `packages/ai/src/workflows/vision-analysis.ts` to implement the parallel race and trigger the Inngest event.
- [ ] **Task 3.2: Robust Error Handling** - Ensure cache failures and background trigger failures are swallowed and logged, not thrown.
- [ ] **Task 3.3: Red/Green TDD** - Update existing vision analysis tests to verify the parallel execution and resilience.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Workflow Hardening' (Protocol in workflow.md)
