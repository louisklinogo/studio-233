# Agent Development Guidelines

## Project Overview

**Goal:** This project focuses on building production-ready AI agents for image/video generation on a canvas interface using the Vercel AI SDK. The architecture follows a Hub-and-Spoke Orchestrator pattern.

**Framework:** Vercel AI SDK v6
**Language:** TypeScript
**Telemetry:** LangWatch

This project follows the Better Agents standard for building production-ready AI agents.

---

## Core Principles

### 1. Agent Testing

Testing is critical for ensuring agent reliability. We use a combination of unit tests for tools and end-to-end scenario tests for multi-turn conversations.

- Write simulation tests for multi-turn conversations
- Validate edge cases
- Ensure business value is delivered
- Test different conversation paths

Best practices:
- NEVER check for regex or word matches in the agent's response, use judge criteria instead
- Use deterministic checks for tool calls and database entries
- For complex behaviors, use LLM-as-a-judge criteria
- Write as few scenarios as possible, covering broad ground with high-quality test cases

### 2. Prompt Management

We manage prompts as structured TypeScript constants to ensure type safety and easy integration with the Vercel AI SDK.

- **Location:** `packages/ai/src/prompts/`
- Never hardcode prompts directly in runtime logic; always export them from the prompt directory.
- Use descriptive names (e.g., `ORCHESTRATOR_PROMPT`) to allow for easy identification.

Example prompt structure:
```typescript
export const MY_AGENT_PROMPT = `
Your system prompt here
`;
```

Usage:
```typescript
import { MY_AGENT_PROMPT } from "../prompts";

const result = await generateText({
  model: myModel,
  system: MY_AGENT_PROMPT,
  prompt: userInput,
});
```

### 3. Observability with LangWatch

We use **LangWatch** for comprehensive tracing, debugging, and performance monitoring of our AI agents.

- All agent executions are automatically traced using the Vercel AI SDK integration.
- Use the `experimental_telemetry: { isEnabled: true }` option in `generateText` and `streamText`.
- Monitor traces in the LangWatch dashboard.

Implementation Example:
```typescript
// Telemetry is enabled automatically in the runtime
// See packages/ai/src/runtime/index.ts
```

---

## Framework-Specific Guidelines

### Vercel AI SDK v6

**Always refer to the official Vercel AI SDK documentation for best practices.**

- **Unified Provider Architecture**: Consistent interface across multiple AI model providers.
- **generateText / streamText**: Standard methods for LLM interaction.
- **Multi-step Agents**: Use `maxSteps` and `onStepFinish` to handle complex tool-calling loops.
- **Stream Responses**: Use `toUIMessageStreamResponse()` for seamless integration with `@ai-sdk/react`.

**Implementation Pattern:**
1. Define specialized agents in `agent-config.ts`.
2. Build toolsets dynamically using the `buildToolset` utility.
3. Handle recursion and delegation via the `delegateToAgent` tool.
4. Persist messages and tool results to the database for thread history.

---

## Project Structure

```
|__ apps/web/           # Next.js application
|__ packages/ai/        # Core agent logic and runtime
|_____ src/prompts/     # TypeScript prompt definitions
|_____ src/runtime/     # Agent configuration and execution
|_____ src/tools/       # Specialized agent tools
|__ tests/scenarios/    # End-to-end agent tests
```

---

## Development Workflow

1. **Understand Requirements**: Clarify the specific expertise and goals of the agent.
2. **Define Tools**: Implement any new specialized tools required in `packages/ai/src/tools/`.
3. **Draft Prompt**: Create a new prompt file in `packages/ai/src/prompts/`.
4. **Register Agent**: Add the agent to `AGENT_DEFINITIONS` in `agent-config.ts`.
5. **Test**: Write a scenario test to verify the agent's behavior and tool usage.
6. **Monitor**: Use LangWatch to observe the agent's performance in development and production.

### Quality Gates

- ✅ All tests pass
- ✅ All tools have Zod schemas for input validation
- ✅ Telemetry is correctly implemented for the new flow
- ✅ No hardcoded secrets
- ✅ Works correctly in streaming mode

