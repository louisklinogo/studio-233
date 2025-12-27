# Track Specification: Agent Orchestration Stabilization

## Overview
This track aims to audit, stabilize, and enhance the agent orchestration system in studio+233. Recent user feedback indicated issues with slow execution, tool input errors, and incorrect delegation logic (e.g., unnecessary aspect ratio prompts for variations).

## Objectives
1.  **Refine Orchestrator Logic:** Clearly distinguish between technical manipulations (Vision Forge) and generative variations (handled directly by Orchestrator).
2.  **Ensure Context Awareness:** Guarantee that `latestImageUrl` and other relevant context are correctly passed through the delegation chain.
3.  **Harden Tool Execution:** Enforce strict tool argument validation and resolve "undefined" input errors.
4.  **Optimize UX Flow:** Enable the Orchestrator to infer aspect ratios from reference images to reduce interactive friction.
5.  **Stabilize Performance:** Investigate and resolve causes of "stuck" execution in the workflow designer/orchestrator.

## Scope
- `packages/ai/src/prompts/orchestrator.ts`
- `packages/ai/src/runtime/index.ts`
- `packages/ai/src/tools/orchestration.ts`
- Associated agent configuration and tool definitions.

## Success Criteria
- "Make this a woman" type requests proceed directly to generation if a reference image is present.
- No "Invalid tool input: expected string, received undefined" errors during delegation.
- Integration tests confirm correct tool selection and argument passing.
- Visual confirmation of streaming updates and tool execution in the chat panel.
