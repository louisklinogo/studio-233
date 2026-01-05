# Track: Agent Orchestration & Ingestion Pipeline Stabilization

## Overview
This track addresses critical failures in the system's core intelligence and ingestion layers. It focuses on resolving database constraint violations during asset ingestion and fixing validation loops in the agent's planning phase. The goal is to move from fragile, error-prone execution to a resilient, self-healing architecture.

## Functional Requirements

### 1. Database Integrity (Ingestion)
- **Hybrid `updatedAt` Fix**:
    - Ensure the `updatedAt` field in the `brand_knowledge` table is explicitly populated with `new Date()` in the application layer (specifically within `packages/rag`).
    - Verify and, if necessary, synchronize the Prisma schema/migrations to ensure DB-level defaults are correctly configured for `DateTime @updatedAt`.

### 2. Agent Planning Resilience (`proposePlan`)
- **Dual Repair Strategy**:
    - **Schema Resilience**: Update the `proposePlan` tool in `packages/ai` to include a pre-processing layer that automatically "lifts" nested parameters (e.g., converting `{ plan: { steps: [] } }` to `{ steps: [] }`) before validation.
    - **Prompt Hardening**: Refine the orchestrator's system prompt to explicitly discourage parameter nesting and emphasize strict adherence to the planning schema.
- **Agent Loop Mitigation**: Implement logic to detect and break repeated tool-calling loops when validation fails multiple times for the same task.

### 3. Self-Healing & Observability
- **Tool Validation Feedback**: If a tool call fails validation, the system must feed the specific Zod error back to the agent as a system message, allowing it to "self-heal" and retry with the corrected format.
- **Enhanced Logging**:
    - Capture and log the raw, unvalidated input from the agent when `proposePlan` is called.
    - Enhance Inngest `brand-ingestion` functions to report detailed error contexts, including the specific `assetId` and `workspaceId` involved in a failure.

## Technical Requirements
- **Packages Affected**:
    - `packages/rag`: Ingestion logic updates.
    - `packages/ai`: Tool definitions, schemas, and system prompts.
    - `packages/db`: Schema verification.
    - `packages/inngest`: Error handling and logging.
- **Testing**:
    - Unit tests for the `proposePlan` pre-processor.
    - Integration tests for the ingestion pipeline ensuring `updatedAt` is never null.
    - Mocked agent tests to verify the self-healing feedback loop.

## Acceptance Criteria
- [ ] Successful ingestion of a brand asset into `brand_knowledge` without `updatedAt` null errors.
- [ ] Orchestrator successfully calls `proposePlan` even if it initially attempts to nest parameters.
- [ ] Agents correctly retry tool calls after receiving schema validation error feedback.
- [ ] raw tool input is visible in logs during development/production.
- [ ] Inngest failures clearly identify the failing asset in logs.

## Out of Scope
- Migrating the entire database to a different ORM.
- Completely redesigning the agent orchestration framework.
