# Agentic Architecture Analysis

## Executive Summary

The `studio+233` codebase currently exhibits a **split personality** regarding its agentic architecture.

1.  **Mastra Framework (Inactive/Dormant):** A fully configured, modern agentic setup exists in `src/mastra`, adhering to best practices like the **Orchestrator-Workers** pattern, specialized agents (Creative, Batch), and structured memory. However, this system is currently **disconnected from the UI** (no API routes expose it).
2.  **Inngest Workflows (Active/Production):** The actual business logic (Batch Processing) is powered by `src/inngest`, utilizing a manual **Evaluator-Optimizer** workflow. This implementation is robust and durable but lacks the flexibility and context-awareness of the Mastra agents.
3.  **UI Disconnect:** The Studio Chat UI (`StudioChatPanel`) points to a non-existent `/api/chat` endpoint, meaning the conversational interface is currently non-functional.

## 1. Current Architecture Overview

### A. The Dual Chat Interfaces
The application has two distinct chat interfaces that require different contexts and capabilities, neither of which is currently fully functional.

| Feature | **Canvas Chat (`/canvas`)** | **Studio Chat (`/studio`)** |
| :--- | :--- | :--- |
| **Component** | `src/components/studio/chat/ChatPanel.tsx` | `src/components/studio+/chat/StudioChatPanel.tsx` |
| **Implementation** | **Mocked / Client-side only**. It accepts input but just simulates a response ("I'm processing your request...") after 1 second. It does NOT connect to any API. | **Broken API Call**. It uses the Vercel AI SDK (`useChat`) to call `/api/chat`, but that endpoint **does not exist**. |
| **Required Context** | Needs access to **Canvas State** (images on canvas, layers, selection, active tool). | Needs access to **File Queue** (uploaded files, batch processing status, user preferences). |
| **Current Agent** | None (Simulated). | None (Orchestrator intended, but not connected). |

### B. The Mastra Implementation (`src/mastra`)
This directory contains a high-quality implementation of an agentic network that aligns well with **Anthropic's "Building Effective Agents"** guidelines.

*   **Pattern:** **Orchestrator-Workers**.
    *   `orchestratorAgent`: Acts as the central router, classifying user intent (`CREATIVE`, `TRANSFORM`, `BATCH`) and routing to specialized tools or agents.
    *   `creativeAgent` & `batchAgent`: Specialized sub-agents with distinct system prompts (instructions).
*   **Tools:** Tools like `background-removal` are defined with clear Zod schemas, following **Anthropic's "Effective Tools"** advice for structured data.
*   **Memory:** configured with `LibSQLStore`, supporting both conversation history and potential working memory, aligning with **Mastra's Memory** docs.

**Status:** 🛑 **Dormant**. No API routes (e.g., `/api/chat` or `/api/mastra`) connect this logic to the frontend. The agents are also generic and do not account for the specific context needs of the Canvas vs. Studio pages.

### C. The Inngest Implementation (`src/inngest`)
The active batch processing feature is built on Inngest functions.

*   **Pattern:** **Evaluator-Optimizer (Manual)**.
    *   The `process-fashion-item` function implements a `while` loop that:
        1.  Generates an image (Generator).
        2.  Verifies it using a separate LLM call (Evaluator).
        3.  Retries with feedback if verification fails (Optimizer).
*   **Durability:** High. Inngest ensures that long-running steps (generation, verification) are durable and retriable.
*   **Integration:** Directly calls `generateWithGemini` helper, bypassing the Mastra agent layer entirely.

**Status:** 🟢 **Active**. This is the code actually running when users upload files.

## 2. Alignment with Research & Best Practices

### Anthropic Research Alignment
| Principle | Implementation Status | Notes |
| :--- | :--- | :--- |
| **Orchestrator-Workers** | ✅ Implemented (Mastra) | The `orchestratorAgent` correctly delegates tasks, but isn't running. |
| **Evaluator-Optimizer** | ✅ Implemented (Inngest) | The Inngest function manually implements this loop for quality control. |
| **Tool Ergonomics** | ⚠️ Mixed | Mastra tools are well-structured. Inngest function uses "implicit" tools (hardcoded LLM calls) rather than defined tool definitions. |
| **Context Management** | ❌ Missing in Active Path | The active Inngest workflow does not seem to persist conversation context or "working memory" across user sessions. |

### Mastra Framework Alignment
| Concept | Implementation Status | Notes |
| :--- | :--- | :--- |
| **Agents** | ✅ Defined | Agents are correctly instantiated with instructions and models. |
| **Workflows** | ⚠️ Partial | Workflows (`background-removal`) are defined but likely unused. The Inngest workflow is "manual" code, not a Mastra `createWorkflow`. |
| **Memory** | ❌ Unused | `LibSQL` memory is configured but not effectively utilized since the agents aren't called. |

## 3. Gaps & Critical Findings

1.  **Missing API Route:** The `StudioChatPanel` tries to POST to `/api/chat`, but this route does not exist. The chat feature is effectively broken.
2.  **Logic Duplication:**
    *   `background-removal` logic exists in a Mastra workflow (`src/mastra/workflows/background-removal.ts`) using FAL/Gemini.
    *   Similar generative logic exists in the Inngest function (`process-fashion-item.ts`).
    *   This creates two sources of truth for how AI operations are handled.
3.  **Context Amnesia:** The Inngest workflow processes jobs in isolation. It doesn't "know" about previous user chats or preferences (which `creativeAgent` in Mastra is designed to handle).
4.  **Undefined Canvas Agent:** There is no specific agent configuration for the Canvas interface. The current `orchestrator` is too generic to handle canvas operations like "move that layer left" or "change opacity".

## 4. Recommendations

### Short Term (Fixes)
1.  **Implement `/api/chat`:** Create this Next.js route handler. It should act as the entry point for both interfaces, checking the request body to see if it's coming from `Canvas` or `Studio` and routing to the correct Mastra Agent.
2.  **Define `canvasAgent`:** Create a new Mastra agent specifically for the `/canvas` page. It needs tools to manipulate the canvas state (mocked for now, or via client-side execution instructions).
3.  **Connect Inngest to Mastra:** Instead of calling `generateWithGemini` directly, the Inngest function should call a Mastra Agent (e.g., `batchAgent`) or Workflow. This allows the Agent to handle the logic, while Inngest handles the durability/retries.

### Long Term (Architecture)
1.  **Unified Agent Layer:** Move all "AI Logic" (prompts, tool definitions, verify loops) into **Mastra Agents/Workflows**.
2.  **Inngest as the "Runner":** Use Inngest solely for scheduling and durability. The Inngest function steps should simply be: "Call Mastra Workflow Step 1", "Call Mastra Workflow Step 2".
3.  **Enable Memory:** Utilize Mastra's `workingMemory` to store user preferences (e.g., "I like dark backgrounds") so the Batch workflow can respect them automatically.
