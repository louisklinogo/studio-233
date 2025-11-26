---
name: ai-sdk
description: Implement Vercel AI SDK Core/RSC/UI patterns with streaming, tool calling, and telemetry grounded in our research notes.
---

# AI SDK Implementation Skill

## Purpose
Provide a repeatable recipe for wiring Vercel’s AI SDK (Core, UI, RSC) into Studio+233 services, ensuring consistent streaming UX, tool schemas, and observability.

## Use Cases
- Building chat endpoints (`/api/*`) that leverage `generateText`, `streamText`, or UI message streams.
- Adding tool-calling, structured output, or reasoning traces to existing agents.
- Instrumenting telemetry or error handling for AI SDK transports.

## Inputs Needed
1. Target framework surface (Next.js App Router route, RSC action, Edge function, etc.).
2. Model provider + identifier (e.g., `anthropic/claude-3.5-sonnet`).
3. Feature requirements (streaming, tool calling, structured data, UI bridging, transforms).
4. References to any existing hooks/components consuming the stream.

## Procedure
1. **Choose API Surface**  
   - Consult `docs/research/ai-sdk/generating-text.md` for `generateText` use; use `streamText` when interactive latency matters.  
   - For UI integration, map to `ai-sdk-ui/` examples (e.g., `useChat`, message streams).
2. **Define Tooling & Schemas**  
   - Follow `tools-and-tool-calling.md` and `tool-calling.md` instructions: declare Zod schemas, `execute` handlers, and guardrails.  
   - Document each tool’s description + parameter semantics.
3. **Implement Endpoint/Action**  
   - Use research examples for streaming responses (`result.toUIMessageStreamResponse`, `pipeTextStreamToResponse`).  
   - Ensure `onError`, `onChunk`, and `onFinish` callbacks log telemetry per `telemetry.md` guidance.
4. **Client Wiring**  
   - Pair with AI Elements or custom UI using `useChat`, `DefaultChatTransport`, or `useAssistant`.  
   - Respect message part typing (`ToolUIPart`, `ReasoningLogPart`) from `ai-sdk-ui` docs.
5. **Validation**  
   - Write integration tests or mock streams referencing `testing.md`.  
   - Exercise both success and failure (tool error, guardrail stop, transform) paths.

## Deliverables
- API route / action + client integration code.  
- Notes referencing file names from `docs/research/ai-sdk/` consulted.

## Verification Checklist
- ✅ Bun/Next lint + type checks clean.  
- ✅ Manual stream test via `curl` or UI transcript screenshot.  
- ✅ Tool schemas validated via Zod + error responses are actionable.

## Reference Highlights
- `docs/research/ai-sdk/generating-text.md`, `streaming-text-generation` examples.  
- `docs/research/ai-sdk/tools-and-tool-calling.md`, `tool-calling.md`.  
- `docs/research/ai-sdk/ai-sdk-ui/**` for React bindings.  
- `docs/research/ai-sdk/telemetry.md`, `testing.md` for instrumentation + QA.
