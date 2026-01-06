# Implementation Plan: Agent Foundation Hardening

This plan follows the Test-Driven Development (TDD) workflow to harden the agent foundation, synchronize tool naming, and implement resilient self-healing logic.

## Phase 1: Naming Standardization & Middleware [x] [checkpoint: defe479]
Standardize tool IDs to camelCase and implement a middleware layer to handle legacy calls.

- [x] Task: Write tests for tool name canonicalization in `wrapTool` cfbb096
- [x] Task: Implement `camelCase` standardization for all Tool IDs in `packages/ai/src/tools/` cfbb096
- [x] Task: Implement name canonicalization middleware in `packages/ai/src/runtime/tools.ts` cfbb096
- [x] Task: Update `AGENT_DEFINITIONS` in `packages/ai/src/runtime/agent-config.ts` to match new IDs cfbb096
- [x] Task: Conductor - User Manual Verification 'Naming Standardization & Middleware' (Protocol in workflow.md) [x]

## Phase 2: Schema Resilience (Self-Healing Schemas) [x] [checkpoint: f03810b]
Harden the `proposePlan` and `webSearch` tools with Zod preprocessing to handle model hallucinations.

- [x] Task: Write tests for `proposePlan` resilience (mapping `description` and `details`) d70ddde
- [x] Task: Update `proposePlan` tool in `packages/ai/src/tools/planning.ts` with `z.preprocess` and `description` field d70ddde
- [x] Task: Write tests for `webSearch` resilience (handling `queries` array) d70ddde
- [x] Task: Update `webSearch` tool in `packages/ai/src/tools/research.ts` with `z.preprocess` for query normalization d70ddde
- [x] Task: Conductor - User Manual Verification 'Schema Resilience' (Protocol in workflow.md) [x]

## Phase 3: Prompt Synchronization & Schema Injection [x] [checkpoint: d402692]
Synchronize system prompts with the code and inject explicit schemas to guide the models.

- [x] Task: Update `ORCHESTRATOR_PROMPT` in `packages/ai/src/prompts/orchestrator.ts` with new IDs and JSON Schema blocks 80cafbc
- [x] Task: Update `INSIGHT_RESEARCHER_PROMPT` and other prompts in `packages/ai/src/prompts/` 80cafbc
- [x] Task: Verify prompt synchronization by running a test generation pass d402692
- [x] Task: Conductor - User Manual Verification 'Prompt Synchronization' (Protocol in workflow.md) [x]

## Phase 4: Runtime Stabilization (Streaming Self-Healing) [ ]
Port the self-healing retry logic to the streaming response runtime.

- [x] Task: Write tests for `streamAgentResponse` validation recovery
- [x] Task: Implement "Retry with Error Context" logic in `streamAgentResponse` in `packages/ai/src/runtime/index.ts`
- [x] Task: Verify end-to-end streaming recovery with a forced validation error
- [x] Task: Conductor - User Manual Verification 'Runtime Stabilization' (Protocol in workflow.md)
