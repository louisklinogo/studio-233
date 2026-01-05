# Implementation Plan: Agent Foundation Hardening

This plan follows the Test-Driven Development (TDD) workflow to harden the agent foundation, synchronize tool naming, and implement resilient self-healing logic.

## Phase 1: Naming Standardization & Middleware [x] [checkpoint: defe479]
Standardize tool IDs to camelCase and implement a middleware layer to handle legacy calls.

- [x] Task: Write tests for tool name canonicalization in `wrapTool` cfbb096
- [x] Task: Implement `camelCase` standardization for all Tool IDs in `packages/ai/src/tools/` cfbb096
- [x] Task: Implement name canonicalization middleware in `packages/ai/src/runtime/tools.ts` cfbb096
- [x] Task: Update `AGENT_DEFINITIONS` in `packages/ai/src/runtime/agent-config.ts` to match new IDs cfbb096
- [x] Task: Conductor - User Manual Verification 'Naming Standardization & Middleware' (Protocol in workflow.md) [x]

## Phase 2: Schema Resilience (Self-Healing Schemas) [ ]
Harden the `proposePlan` and `webSearch` tools with Zod preprocessing to handle model hallucinations.

- [ ] Task: Write tests for `proposePlan` resilience (mapping `description` and `details`)
- [ ] Task: Update `proposePlan` tool in `packages/ai/src/tools/planning.ts` with `z.preprocess` and `description` field
- [ ] Task: Write tests for `webSearch` resilience (handling `queries` array)
- [ ] Task: Update `webSearch` tool in `packages/ai/src/tools/research.ts` with `z.preprocess` for query normalization
- [ ] Task: Conductor - User Manual Verification 'Schema Resilience' (Protocol in workflow.md)

## Phase 3: Prompt Synchronization & Schema Injection [ ]
Synchronize system prompts with the code and inject explicit schemas to guide the models.

- [ ] Task: Update `ORCHESTRATOR_PROMPT` in `packages/ai/src/prompts/orchestrator.ts` with new IDs and JSON Schema blocks
- [ ] Task: Update `INSIGHT_RESEARCHER_PROMPT` and other prompts in `packages/ai/src/prompts/`
- [ ] Task: Verify prompt synchronization by running a test generation pass
- [ ] Task: Conductor - User Manual Verification 'Prompt Synchronization' (Protocol in workflow.md)

## Phase 4: Runtime Stabilization (Streaming Self-Healing) [ ]
Port the self-healing retry logic to the streaming response runtime.

- [ ] Task: Write tests for `streamAgentResponse` validation recovery
- [ ] Task: Implement "Retry with Error Context" logic in `streamAgentResponse` in `packages/ai/src/runtime/index.ts`
- [ ] Task: Verify end-to-end streaming recovery with a forced validation error
- [ ] Task: Conductor - User Manual Verification 'Runtime Stabilization' (Protocol in workflow.md)
