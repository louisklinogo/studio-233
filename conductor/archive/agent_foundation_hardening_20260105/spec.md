# Specification: Agent Foundation Hardening (Production & Scalability)

## Overview
This track addresses the root causes of recurring tool validation errors by standardizing the tool execution contract, hardening Zod schemas with self-healing logic, and synchronizing system prompts with the actual implementation.

## Functional Requirements
- **Naming Standardization**: 
    - Globally migrate all Tool IDs and prompt references to `camelCase` (e.g., `web-search` -> `webSearch`, `canvas-text-to-image` -> `canvasTextToImage`).
    - Sync `id` and `name` to be identical across `tools.ts` and `agent-config.ts`.
- **Resilient Schemas (Parity Fixes)**: 
    - **Plan Tool**: Add `description` field to `proposePlan` steps (to match UI `<PlanDescription />`) and map model hallucinations of `details` or `description` correctly via `z.preprocess`.
    - **Search Tool**: Update `webSearch` to accept and normalize both `query: string` and `queries: string[]` (mapping to a single robust query).
- **Interface Middleware**: Implement a "Canonicalization" layer in `wrapTool` to normalize incoming tool names (handling hyphens/underscores) before execution.
- **Prompt Synchronization**: 
    - Update `ORCHESTRATOR_PROMPT` and `INSIGHT_RESEARCHER_PROMPT` to use the new `camelCase` IDs.
    - Inject explicit JSON Schema blocks for complex tools (`proposePlan`, `webSearch`) into system prompts.
- **Streaming Self-Healing**: Port the "Retry with Error Context" logic from `generateAgentResponse` into `streamAgentResponse` to ensure streaming stability.

## Non-Functional Requirements
- **Observability**: Log every tool name normalization event as a `warning` to track prompt technical debt.
- **Stability**: Ensure the `proposePlan` output structure remains fully compatible with the `Plan` UI component.

## Acceptance Criteria
- [ ] `webSearch` tool successfully called by agents using the new name.
- [ ] `proposePlan` tool calls successfully populate the `description` field in the UI.
- [ ] `streamAgentResponse` successfully retries and recovers from a validation error by providing feedback to the model.
- [ ] All system prompts match the tool IDs defined in `tools.ts`.
