- [Documentation](https://www.inngest.com/docs)
- [Examples](https://www.inngest.com/docs/examples)
- [AgentKit](https://agentkit.inngest.com/overview)

Search... `Ctrl+K`

[Contact sales](https://www.inngest.com/contact?ref=docs-header) [Sign Up](https://app.inngest.com/sign-up?ref=docs-header)

Search...

- [Documentation](https://www.inngest.com/docs)
- [Examples](https://www.inngest.com/docs/examples)
- [AgentKit](https://agentkit.inngest.com/overview)

[Home](https://www.inngest.com/docs)

## Quick start

- [Next.js](https://www.inngest.com/docs/getting-started/nextjs-quick-start)
- [Node.js](https://www.inngest.com/docs/getting-started/nodejs-quick-start)
- [Python](https://www.inngest.com/docs/getting-started/python-quick-start)

## Inngest tour

- [Install the SDK](https://www.inngest.com/docs/sdk/overview)
- [Your first Functions](https://www.inngest.com/docs/learn/inngest-functions)
- [Leveraging Steps](https://www.inngest.com/docs/learn/inngest-steps)
- [Setting up your app](https://www.inngest.com/docs/learn/serving-inngest-functions)

## Features

## Local Development

## Events & Triggers

## Inngest Functions

- [Overview](https://www.inngest.com/docs/features/inngest-functions)

## Steps & Workflows

- [Overview](https://www.inngest.com/docs/features/inngest-functions/steps-workflows)
- [Function steps](https://www.inngest.com/docs/guides/multi-step-functions)
- [Sleeps](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps)
- [Wait for events](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event)
- [AI Inference](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration)
- [Fetch](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch)
- Guides
- [How Functions are executed](https://www.inngest.com/docs/learn/how-functions-are-executed)
- [User-defined Workflows](https://www.inngest.com/docs/guides/user-defined-workflows)
- Patterns
- [Parallel steps](https://www.inngest.com/docs/guides/step-parallelism)
- [Loops over steps](https://www.inngest.com/docs/guides/working-with-loops)
- Use cases
- [Trigger workflows from Retool](https://www.inngest.com/docs/guides/trigger-your-code-from-retool)

## Flow Control

## Errors & Retries

## Cancellation

- [REST Endpointsnew](https://www.inngest.com/docs/learn/rest-endpoints)
- [Versioning](https://www.inngest.com/docs/learn/versioning)
- [Logging](https://www.inngest.com/docs/guides/logging)

## Realtimenew

## Middleware

## Platform

## Deploymentnew

## Manage

## Monitor

- [Security](https://www.inngest.com/docs/learn/security)
- [Limitations](https://www.inngest.com/docs/usage-limits/inngest)

## AI

- [Dev Server MCP](https://www.inngest.com/docs/ai-dev-tools/mcp)
- [AgentKit](https://agentkit.inngest.com/)

## References

## TypeScript SDK

## Python SDK

## Go SDK

- [REST API](https://api-docs.inngest.com/docs/inngest-api/1j9i5603g5768-introduction)

## System events

## Workflow Kit

- [FAQ](https://www.inngest.com/docs/faq)
- [Release Phases](https://www.inngest.com/docs/release-phases)
- [Glossary](https://www.inngest.com/docs/learn/glossary)

- [Contact sales](https://www.inngest.com/contact?ref=docs-mobile-nav) [Sign Up](https://app.inngest.com/sign-up?ref=docs-mobile-nav)

#### On this page

- [AI Inference](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration#top)
- [Benefits](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration#benefits)
- [Step tools: step.ai](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration#step-tools-step-ai)
- [step.ai.infer()](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration#step-ai-infer)
- [step.ai.wrap() (TypeScript only)](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration#step-ai-wrap-type-script-only)
- [Supported providers](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration#supported-providers)
- [Limitations](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration#limitations)
- [AgentKit: AI and agent orchestration](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration#agent-kit-ai-and-agent-orchestration)

Features [Inngest Functions](https://www.inngest.com/docs/features/inngest-functions) [Steps & Workflows](https://www.inngest.com/docs/features/inngest-functions/steps-workflows)

# AI Inference TypeScript and Python only

You can build complex AI workflows and call model providers as steps using two-step methods, `step.ai.infer()` and `step.ai.wrap()`, or our AgentKit SDK. They work with any model provider, and all offer full AI observability:

- `step.ai.wrap()` wraps other AI SDKs (OpenAI, Anthropic, and Vercel AI SDK) as a step, augmenting the observability of your Inngest Functions with information such as prompts and tokens used.
- `step.ai.infer()` offloads the inference request to Inngest's infrastructure, pausing your function execution until the request finishes. This can be a significant cost saver if you deploy to serverless functions
- [AgentKit](https://agentkit.inngest.com/) allows you to easily create single model calls or agentic workflows.

### [Benefits](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration\#benefits)

Using `step.ai` or [AgentKit](https://agentkit.inngest.com/) allows you to:

- Automatically monitor AI usage in production to ensure quality output
- Easily iterate and test prompts in the dev server
- Track requests and responses from foundational inference providers
- Track how inference calls work together in multi-step or agentic workflows

## [Step tools: `step.ai`TypeScriptPython v0.5+](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration\#step-tools-step-ai)

### [`step.ai.infer()`](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration\#step-ai-infer)

Using `step.ai.infer()` allows you to call any inference provider's endpoints by offloading it to Inngest's infrastructure.
All requests and responses are automatically tracked within your workflow traces.

**Request offloading**

On serverless environments, your function is not executing while the request is in progress — which means you don't pay for function execution while waiting for the provider's response.
Once the request finishes, your function restarts with the inference result's data. Inngest never logs or stores your API keys or authentication headers. Authentication originates from your own functions.

Here's an example which calls OpenAI:

TypeScriptPython

CopyCopied

```ts
export default inngest.createFunction(
  { id: "summarize-contents" },
  { event: "app/ticket.created" },
  async ({ event, step }) => {

    // This calls your model's chat endpoint, adding AI observability,
    // metrics, datasets, and monitoring to your calls.
    const response = await step.ai.infer("call-openai", {
      model: step.ai.models.openai({ model: "gpt-4o" }),
      // body is the model request, which is strongly typed depending on the model
      body: {
        messages: [{\
          role: "assistant",\
          content: "Write instructions for improving short term memory",\
        }],
      },
    });

    // The response is also strongly typed depending on the model.
    return response.choices;
  }
);
```

[**PDF processing with Claude Sonnet and step.ai.infer()**\\
\\
Use `step.ai.infer()` to process a PDF with Claude Sonnet.](https://github.com/inngest/inngest-js/tree/main/examples//step-ai/anthropic-claude-pdf-processing/#readme)

### [`step.ai.wrap()` (TypeScript only)](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration\#step-ai-wrap-type-script-only)

Using `step.ai.wrap()` allows you to wrap other TypeScript AI SDKs, treating each inference call as a step. This allows you to easily convert AI calls to steps with full observability without changing much application-level code:

Vercel AI SDKAnthropic SDK

CopyCopied

```ts
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export default inngest.createFunction(
  { id: "summarize-contents" },
  { event: "app/ticket.created" },
  async ({ event, step }) => {

    // This calls `generateText` with the given arguments, adding AI observability,
    // metrics, datasets, and monitoring to your calls.
    const { text } = await step.ai.wrap("using-vercel-ai", generateText, {
      model: openai("gpt-4-turbo"),
      prompt: "What is love?"
    });

  }
);
```

In this case, instead of calling the SDK directly, you specify the SDK function you want to call and the function's arguments separately within `step.ai.wrap()`.

### [Supported providers](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration\#supported-providers)

The list of current providers supported for `step.ai.infer()` is:

- `openai`, including any OpenAI compatible API such as Perplexity
- `gemini`
- `anthropic`
- `grok`
- `azure-openai`

### [Limitations](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration\#limitations)

- Streaming responses from providers is coming soon, alongside real-time support with Inngest functions.

- When using `step.ai.wrap` with sdk clients that require client instance context to be preserved between
invocations, currently it's necessary to bind the client call outside the `step.ai.wrap` call like so:


Wrap Anthropic SDKWrap OpenAI SDK

CopyCopied

```ts
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();

export const anthropicWrapGenerateText = inngest.createFunction(
  { id: "anthropic-wrap-generateText" },
  { event: "anthropic/wrap.generate.text" },
  async ({ event, step }) => {
    //
    // Will fail because anthropic client requires instance context
    // to be preserved across invocations.
    await step.ai.wrap(
      "using-anthropic",
      anthropic.messages.create,
      {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: "Hello, Claude" }],
      },
    );

    //
    // Will work beccause we bind to preserve instance context
    const createCompletion = anthropic.messages.create.bind(anthropic.messages);
    await step.ai.wrap(
      "using-anthropic",
      createCompletion,
      {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: "Hello, Claude" }],
      },
    );
  },
);
```

- When using `step.ai.wrap`, you can edit prompts and rerun steps in the dev server.
But, arguments must be JSON serializable.

CopyCopied

```ts
import { generateText as vercelGenerateText } from "ai";
import { openai as vercelOpenAI } from "@ai-sdk/openai";

export const vercelWrapGenerateText = inngest.createFunction(
  { id: "vercel-wrap-generate-text" },
  { event: "vercel/wrap.generate.text" },
  async ({ event, step }) => {
    //
    // Will work but you will not be able to edit the prompt and rerun the step in the dev server.
    await step.ai.wrap(
      "vercel-openai-generateText",
      vercelGenerateText,
      {
        model: vercelOpenAI("gpt-4o-mini"),
        prompt: "Write a haiku about recursion in programming.",
      },
    );

    //
    // Will work and you will be able to edit the prompt and rerun the step in the dev server because
    // the arguments to step.ai.wrap are JSON serializable.
    const args = {
      model: "gpt-4o-mini",
      prompt: "Write a haiku about recursion in programming.",
    };

    const gen = ({ model, prompt }: { model: string; prompt: string }) =>
      vercelGenerateText({
        model: vercelOpenAI(model),
        prompt,
      });

    await step.ai.wrap("using-vercel-ai", gen, args);
  },
);
```

- `step.ai.wrap's` Typescript definition will for the most part infer allowable inputs based on the
signature of the wrapped function. However, in some cases where the wrapped function contains complex
overloads, such as Vercel's `generateObject`, it may be necessary to type cast.

_Note_: Future version of the Typescript SDK will correctly infer these complex types, but for now we
require type casting to ensure backward compatibility.

CopyCopied

```ts
import { generateObject as vercelGenerateObject } from "ai";
import { openai as vercelOpenAI } from "@ai-sdk/openai";

export const vercelWrapSchema = inngest.createFunction(
  { id: "vercel-wrap-generate-object" },
  { event: "vercel/wrap.generate.object" },
  async ({ event, step }) => {
    //
    // Calling generateObject directly is fine
    await vercelGenerateObject({
      model: vercelOpenAI("gpt-4o-mini"),
      schema: z.object({
        recipe: z.object({
          name: z.string(),
          ingredients: z.array(
            z.object({ name: z.string(), amount: z.string() }),
          ),
          steps: z.array(z.string()),
        }),
      }),
      prompt: "Generate a lasagna recipe.",
    });

    //
    // step.ai.wrap requires type casting
    await step.ai.wrap(
      "vercel-openai-generateObject",
      vercelGenerateObject,
      {
        model: vercelOpenAI("gpt-4o-mini"),
        schema: z.object({
          recipe: z.object({
            name: z.string(),
            ingredients: z.array(
              z.object({ name: z.string(), amount: z.string() }),
            ),
            steps: z.array(z.string()),
          }),
        }),
        prompt: "Generate a lasagna recipe.",
      } as any,
    );
  },
);
```

## [AgentKit: AI and agent orchestration TypeScript only](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration\#agent-kit-ai-and-agent-orchestration)

AgentKit is a simple, standardized way to implement model calling — either as individual calls, a complex workflow, or agentic flows.

Here's an example of a single model call:

CopyCopied

```ts

import { Agent, agenticOpenai as openai, createAgent } from "@inngest/agent-kit";
export default inngest.createFunction(
  { id: "summarize-contents" },
  { event: "app/ticket.created" },
  async ({ event, step }) => {

    // Create a new agent with a system prompt (you can add optional tools, too)
    const writer = createAgent({
      name: "writer",
      system: "You are an expert writer.  You write readable, concise, simple content.",
      model: openai({ model: "gpt-4o", step }),
    });

    // Run the agent with an input.  This automatically uses steps
    // to call your AI model.
    const { output } = await writer.run("Write a tweet on how AI works");
  }
);
```

[Read the full AgentKit docs here](https://agentkit.inngest.com/) and [see the code on GitHub](https://github.com/inngest/agent-kit).

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/inngest-functions/steps-workflows/step-ai-orchestration.mdx)

[Previous](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event) [Wait for events](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event)

[Next](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch) [Fetch](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)