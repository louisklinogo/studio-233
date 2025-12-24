# Track Plan: Agent Orchestration Stabilization

## Phase 1: Logic Refinement & Prompt Engineering
- [x] Task: Update Orchestrator System Prompt to clarify delegation vs. direct handling (131b85f)
- [x] Task: Implement aspect ratio inference logic in Orchestrator prompt for variations (131b85f)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Logic Refinement & Prompt Engineering' (Protocol in workflow.md)

## Phase 2: Context Awareness & Tool Hardening
- [ ] Task: Enhance `delegateToAgent` tool to strictly validate and pass `latestImageUrl`
- [ ] Task: Inject system-level awareness of reference images into `runtime/index.ts`
- [ ] Task: Resolve "undefined" input errors in `orchestration.ts` tool call execution
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Context Awareness & Tool Hardening' (Protocol in workflow.md)

## Phase 3: Verification & Integration Testing
- [ ] Task: Create integration test for generative variation workflow (Orchestrator -> Vision -> Generation)
- [ ] Task: Create integration test for technical manipulation delegation (Orchestrator -> Vision Forge)
- [ ] Task: Verify end-to-side streaming and status lights in the Chat Panel
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Verification & Integration Testing' (Protocol in workflow.md)
