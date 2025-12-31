# Specification: Track - brand_ambient_context_20251231

## Overview
This track implements a "Layered Context Resolution" system to transition the AI Agent from "On-Demand" brand awareness (calling tools) to "Ambient" brand awareness (pre-emptive prompt injection). This ensures agents are natively brand-aware from the first interaction without increasing perceived latency.

## Functional Requirements
- **Internal Brand Package:** Create `packages/brand` to house the `BrandResolver` service.
- **Identity Resolution:** The resolver must fetch core workspace identity (primary/accent colors, fonts) from the database or KV cache.
- **Semantic Retrieval:** Integrate `@studio233/rag` to perform a pre-emptive vector search (Top 3 snippets) based on the incoming user query.
- **Prompt Injection:** Append a structural `<IDENTITY_PROTOCOL>` block to the agent's system prompt before execution.
- **Parallel Execution:** Orchestrate context resolution in parallel with session/thread fetching in the `/api/chat` route.
- **Visual DNA Inclusion:** Include vision analysis summaries from the brand archive in the injected context.

## Non-Functional Requirements
- **Performance:** Perceived latency overhead for brand resolution must be near 0ms (achieved via parallelism).
- **Modularity:** The AI runtime must remain "pure," receiving context via a standardized interface rather than querying the DB directly.
- **Scalability:** Core identity signals should be cached in Vercel KV with a 5-minute TTL.

## Acceptance Criteria
- [ ] Agents use brand colors and fonts in their reasoning and tool calls without being explicitly told.
- [ ] Chat logs show the `<IDENTITY_PROTOCOL>` block injected into the system prompt.
- [ ] No significant regression in chat response time.
- [ ] `packages/brand` correctly exports a `resolveContext` method used by the chat endpoint.

## Out of Scope
- Modifying the existing `consultBrandGuidelines` tool (it remains as a deep-dive fallback).
- Adding UI for managing brand assets (handled in previous tracks).
