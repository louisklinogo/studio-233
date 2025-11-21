- [Documentation](https://www.inngest.com/docs)
- [Examples](https://www.inngest.com/docs/examples)
- [AgentKit](https://agentkit.inngest.com/overview)

Search... `Ctrl+K`

[Contact sales](https://www.inngest.com/contact?ref=docs-header) [Sign Up](https://app.inngest.com/sign-up?ref=docs-header)

Search...

- [Documentation](https://www.inngest.com/docs)
- [Examples](https://www.inngest.com/docs/examples)
- [AgentKit](https://agentkit.inngest.com/overview)

## Examples

- [All examples](https://www.inngest.com/docs/examples)
- [AI Agents and RAG](https://www.inngest.com/docs/examples/ai-agents-and-rag)
- [Email Sequence](https://www.inngest.com/docs/examples/email-sequence)
- [Scheduling a one-off function](https://www.inngest.com/docs/examples/scheduling-one-off-function)
- [Fetch run status and output](https://www.inngest.com/docs/examples/fetch-run-status-and-output)
- [Track all function failures in Datadog](https://www.inngest.com/docs/examples/track-failures-in-datadog)
- [Cleanup after function cancellation](https://www.inngest.com/docs/examples/cleanup-after-function-cancellation)
- [Fetch: Durable HTTP requests](https://www.inngest.com/docs/examples/fetch)
- [Stream updates from functions](https://www.inngest.com/docs/examples/realtime)

## Middleware

- [Cloudflare Workers & Hono environment variables](https://www.inngest.com/docs/examples/middleware/cloudflare-workers-environment-variables)

- [Contact sales](https://www.inngest.com/contact?ref=docs-mobile-nav) [Sign Up](https://app.inngest.com/sign-up?ref=docs-mobile-nav)

#### On this page

- [Fetch: performing API requests or fetching data](https://www.inngest.com/docs/examples/fetch#top)
- [Getting started with step.fetch()](https://www.inngest.com/docs/examples/fetch#getting-started-with-step-fetch)
- [Parallelize HTTP requests with step.fetch()](https://www.inngest.com/docs/examples/fetch#parallelize-http-requests-with-step-fetch)
- [Make 3rd party library HTTP requests durable with the fetch() utility](https://www.inngest.com/docs/examples/fetch#make-3rd-party-library-http-requests-durable-with-the-fetch-utility)

[Examples](https://www.inngest.com/docs/examples)

# Fetch: performing API requests or fetching data TypeScript only

The Inngest TypeScript SDK provides a `step.fetch()` API and a `fetch()` utility, enabling you to make requests to third-party APIs or fetch data in a durable way by offloading them to the Inngest Platform.

For more information on how Fetch works, see the [Fetch documentation](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/fetch).

## [Getting started with `step.fetch()`](https://www.inngest.com/docs/examples/fetch\#getting-started-with-step-fetch)

The `step.fetch()` API enables you to make durable HTTP requests while offloading them to the Inngest Platform, saving you compute and improving reliability:

### src/inngest/functions.ts

CopyCopied

```ts
import { inngest } from "./client";

export const retrieveTextFile = inngest.createFunction(
  { id: "retrieveTextFile" },
  { event: "textFile/retrieve" },
  async ({ step }) => {
    // The fetching of the text file is offloaded to the Inngest Platform
    const response = await step.fetch(
      "https://example-files.online-convert.com/document/txt/example.txt"
    );

    // The Inngest function run is resumed when the HTTP request is complete
    await step.run("extract-text", async () => {
      const text = await response.text();
      const exampleOccurences = text.match(/example/g);
      return exampleOccurences?.length;
    });
  }
);
```

`step.fetch()` takes the same arguments as the [native `fetch` API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

[**Clone this example on GitHub**\\
\\
Check out this complete `step.fetch()` example on GitHub.](https://github.com/inngest/inngest-js/tree/main/examples/node-step-fetch/)

## [Parallelize HTTP requests with `step.fetch()`](https://www.inngest.com/docs/examples/fetch\#parallelize-http-requests-with-step-fetch)

`step.fetch()` shares all the benefits of `step.run()`, including the ability to parallelize requests using `Promise.all()`:

CopyCopied

```typescript
const processFiles = inngest.createFunction(
  { id: "process-files", concurrency: 10 },
  { event: "files/process" },
  async ({ step, event }) => {
    // All requests will be offloaded and processed in parallel while matching the concurrency limit
    const responses = await Promise.all(event.data.files.map(async (file) => {
      return step.fetch(`https://api.example.com/files/${file.id}`)
    }))

    // Your Inngest function is resumed here with the responses
    await step.run("process-file", async (file) => {
      const body = await response.json()
      // body.files
    })
  }
)
```

Note that `step.fetch()`, like all other `step` APIs, matches your function's configuration such as [concurrency](https://www.inngest.com/docs/guides/concurrency) or [throttling](https://www.inngest.com/docs/guides/throttling).

## [Make 3rd party library HTTP requests durable with the `fetch()` utility](https://www.inngest.com/docs/examples/fetch\#make-3rd-party-library-http-requests-durable-with-the-fetch-utility)

Inngest's `fetch()` utility can be passed as a custom fetch handler to make all the requests made by a 3rd party library durable.

For example, you can pass the `fetch()` utility to the AI SDK or the OpenAI libraries:

When using the `fetch()` utility with the AI SDK, you need to disable the AI SDK's built-in retry mechanism and let Inngest handle retries instead.

Below you can see we are using the `fetch()` utility with the AI SDK and disabling the AI SDK's built-in retry mechanism by setting `maxRetries: 0`.

AI SDKOpenAI SDK

CopyCopied

```typescript
import { fetch as inngestFetch } from 'inngest';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Pass the Inngest fetch utility to the AI SDK's model constructor:
const anthropic = createAnthropic({
  fetch: inngestFetch,
});

const weatherFunction = inngest.createFunction(
  { id: "weather-function" },
  { event: "weather/get" },
  async ({ step }) => {
    // This request is offloaded to the Inngest platform
    // and it also retries automatically if it fails!
    const response = await generateText({
      model: anthropic('claude-3-5-sonnet-20240620'),
      prompt: `What's the weather in London?`,
      maxRetries: 0,
    });
  }
)
```

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/examples/fetch.mdx)

[Previous](https://www.inngest.com/docs/examples/cleanup-after-function-cancellation) [Cleanup after function cancellation](https://www.inngest.com/docs/examples/cleanup-after-function-cancellation)

[Next](https://www.inngest.com/docs/examples/realtime) [Stream updates from functions](https://www.inngest.com/docs/examples/realtime)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)