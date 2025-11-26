---
name: agent-architect
description: Design evaluation-driven multi-agent systems by combining Anthropic agent tooling guidance with Mastra workflows and AI SDK experience layers.
---

# Agent Architect

## Purpose
Synthesize Anthropic’s research on effective agent tooling with Mastra’s TypeScript-first agent/workflow stack and Vercel AI SDK interface patterns to produce actionable architecture blueprints for multi-agent initiatives.

## When to Use
- The user requests strategy or implementation plans for multi-agent platforms, MCP servers, or complex tool ecosystems.
- A feature requires coordinating multiple reasoning loops, workflow graphs, or UI surfaces (e.g., operator consoles, copilots) backed by Mastra services.
- You must encode evaluation plans, observability, and safety guardrails before any hands-on coding begins.

## Required Inputs
1. Business objective & success metrics (latency, accuracy, autonomy boundaries).
2. Inventory of existing tools/APIs plus ownership constraints.
3. User journeys or operational runbooks that must be preserved.
4. Deployment targets (Mastra server, Next.js RSC UI, standalone workers) and governance requirements.

## Workflow
1. **Context Intake**  
   - Summarize the problem, stakeholders, and constraints.  
   - Cross-reference prior art in `docs/research/anthropic/*.md` and relevant Mastra modules (agents, workflows, observability) to ensure terminology consistency.
2. **Tooling & Namespacing Plan**  
   - Apply the “choose the right tools, namespace clearly, and return high-signal context” principles from `anthropic-effective-tools-for-agents.md`.  
   - Map desired capabilities to MCP servers or Mastra services; explicitly call out which docs inform each tool contract.
3. **Architecture Blueprint**  
   - Lay out agent roles, memories, and workflow graphs referencing `docs/research/mastra/**` (agents, memory, workflows).  
   - Describe how UI layers (Next.js, RSC, AI SDK UI) consume the agents, citing the appropriate `docs/research/ai-sdk/*.md` sections (e.g., streaming, tool calling, UI components).
4. **Evaluation & Verification Loop**  
   - Define prototype + evaluation steps per Anthropic guidance: generate task suites, chain-of-thought prompts, and telemetry you will collect.  
   - Specify Mastra observability hooks and AI SDK telemetry instrumentation.
5. **Deliverables**  
   - Provide a written architecture memo with: objectives, actors/tools, context pipeline, workflow diagrams or tables, evaluation plan, and risk/rollback notes.  
   - Include references to every supporting doc you used.

## Success Criteria
- Architecture doc links each capability decision back to Anthropic + Mastra + AI SDK references.
- Tool surface areas are namespaced, token-efficient, and include evaluation coverage.
- Clear verification checklist exists before any implementation skill is invoked.

## Verification Checklist
- ✅ Confirm all cited docs exist and remain current (list file paths).
- ✅ Ensure evaluation plan covers both success metrics and failure diagnostics.
- ✅ Provide next steps (e.g., which implementation skill should run afterward).

## Supporting Material
- `docs/research/anthropic/` – tool ergonomics, evaluation methodology, context discipline.
- `docs/research/mastra/` – agent/workflow architecture, storage, observability, deployment.
- `docs/research/ai-sdk/` – Vercel AI SDK Core/UI usage, streaming patterns, tool UIs.
