# Plan: Agent Orchestration & Ingestion Pipeline Stabilization

## Phase 1: Ingestion Integrity & Database Fixes
- [x] Task: Create `packages/rag/src/__tests__/ingestion-integrity.test.ts` to verify `updatedAt` is populated during indexing. [023cf98]
- [x] Task: Update `packages/rag/src/ingestion.ts` (and multimodal-service.ts) to explicitly set `updatedAt` on all document/node insertions. [023cf98]
- [x] Task: Run database migrations check to ensure `DateTime @updatedAt` is correctly handled at the PostgreSQL level. [023cf98]
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Ingestion Integrity' (Protocol in workflow.md)

## Phase 2: Agent Planning Resilience
- [ ] Task: Create `packages/ai/src/tools/__tests__/planning-resilience.test.ts` with test cases for nested/malformed `proposePlan` inputs.
- [ ] Task: Update `packages/ai/src/tools/planning.ts` to implement a pre-processor that "lifts" nested parameters (e.g., `plan.steps` -> `steps`).
- [ ] Task: Refactor `packages/ai/src/prompts/orchestrator.ts` to use "negative constraints" (e.g., "NEVER do X") for better instruction following.
- [ ] Task: Rewrite agent prompts in `packages/ai/src/prompts/*.ts` using strict XML tagging structure (<instructions>, <examples>, <constraints>) to improve adherence. Read \\wsl.localhost\Ubuntu\home\paco\projects\studio+233\build-issues.txt first before implementation
- [ ] Task: Implement dynamic date injection in Orchestrator system prompt to ground agent in current time.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Planning Resilience' (Protocol in workflow.md)

## Phase 3: Self-Healing & Observability
- [ ] Task: Implement a middleware or error-handler in the AI runtime to catch Zod validation errors and format them as system feedback for the agent.
- [ ] Task: Add raw input logging to `packages/ai/src/runtime/tools.ts` (or relevant tool executor) to capture model output before validation.
- [ ] Task: Update `packages/inngest/src/functions/brand-ingestion.ts` to wrap operations in try/catch blocks that log `assetId` and `workspaceId` on failure.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Self-Healing & Observability' (Protocol in workflow.md)
