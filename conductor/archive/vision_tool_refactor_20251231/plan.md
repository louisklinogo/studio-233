# Implementation Plan - Vision Tooling Refactor

## Phase 1: Tool Implementation [checkpoint: db0fd5b]
- [x] Task: Implement `renderHtml` Tool (ecfb185)
    - [ ] Create `packages/ai/src/tools/render-html.ts` with strict schema.
    - [ ] Unit test: Verify execution wraps `htmlRenderWorkflow`.
    - [ ] Unit test: Verify validation fails if `html` is missing.
- [x] Task: Refactor `htmlToCanvas` Tool (3da37af)
    - [ ] Modify `packages/ai/src/tools/html-to-canvas.ts`.
    - [ ] Remove `html`/`css` from input schema.
    - [ ] Unit test: Verify it strictly requires `brief`.
- [ ] Task: Conductor - User Manual Verification 'Tool Implementation' (Protocol in workflow.md)

## Phase 2: System Wiring & Intelligence [checkpoint: 581e2e4]
- [x] Task: Register Tools & Update Config (bc86e8b)
    - [ ] Update `packages/ai/src/runtime/agent-config.ts` to include `renderHtml`.
- [x] Task: Update Agent Prompts (The "Brain" Upgrade) (5e0977f)
    - [ ] Update `ORCHESTRATOR_PROMPT` in `packages/ai/src/prompts/orchestrator.ts` with new Decision Logic table.
    - [ ] Update `VISION_FORGE_PROMPT` in `packages/ai/src/prompts/vision-forge.ts` with new Decision Logic table.
- [ ] Task: Conductor - User Manual Verification 'System Wiring & Intelligence' (Protocol in workflow.md)

## Phase 3: Validation [checkpoint: 6f4117d]
- [x] Task: End-to-End Integration Test (ca2ac55)
    - [ ] Create `packages/ai/src/__tests__/vision-tooling-architecture.test.ts`.
    - [ ] Test agent routing logic for "Design this" vs "Render this".
- [ ] Task: Conductor - User Manual Verification 'Validation' (Protocol in workflow.md)
