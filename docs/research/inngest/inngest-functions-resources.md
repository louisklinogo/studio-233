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

- [Inngest Functions](https://www.inngest.com/docs/features/inngest-functions#top)
- [Using Inngest Functions](https://www.inngest.com/docs/features/inngest-functions#using-inngest-functions)
- [Learn more about Functions and Steps](https://www.inngest.com/docs/features/inngest-functions#learn-more-about-functions-and-steps)
- [SDK References](https://www.inngest.com/docs/features/inngest-functions#sdk-references)

Features

# Inngest Functions

Inngest functions enable developers to run reliable background logic, from background jobs to complex workflows.
An Inngest Function is composed of 3 main parts that provide robust tools for retrying, scheduling, and coordinating complex sequences of operations:

[**Triggers**\\
\\
A list of Events, Cron schedules or webhook events that trigger Function runs.](https://www.inngest.com/docs/features/events-triggers) [**Flow Control**\\
\\
Control how Function runs get distributed in time with Concurrency, Throttling and more.](https://www.inngest.com/docs/guides/flow-control) [**Steps**\\
\\
Transform your Inngest Function into a workflow with retriable checkpoints.](https://www.inngest.com/docs/features/inngest-functions/steps-workflows)

TypeScriptPythonGo

CopyCopied

```ts
inngest.createFunction({
    id: "sync-systems",
    // Easily add Throttling with Flow Control
    throttle: { limit: 3, period: "1min"},
  },
  // A Function is triggered by events
  { event: "auto/sync.request" },
  async ({ step }) => {
    // step is retried if it throws an error
    const data = await step.run("get-data", async () => {
      return getDataFromExternalSource();
    });

    // Steps can reuse data from previous ones
    await step.run("save-data", async () => {
      return db.syncs.insertOne(data);
    });
  }
);
```

## [Using Inngest Functions](https://www.inngest.com/docs/features/inngest-functions\#using-inngest-functions)

Start using Inngest Functions by using the pattern that fits your use case:

[**Background jobs**\\
\\
Run long-running tasks out of the critical path of a request.](https://www.inngest.com/docs/guides/multi-step-functions) [**Delayed Functions**\\
\\
Schedule Functions that run in the future.](https://www.inngest.com/docs/guides/delayed-functions) [**Cron Functions**\\
\\
Build Inngest Functions as CRONs.](https://www.inngest.com/docs/guides/scheduled-functions) [**Workflows**\\
\\
Start creating worflows by leveraging Inngest Function Steps.](https://www.inngest.com/docs/features/inngest-functions/steps-workflows)

## [Learn more about Functions and Steps](https://www.inngest.com/docs/features/inngest-functions\#learn-more-about-functions-and-steps)

Functions and Steps are powered by Inngest's Durable Execution Engine. Learn about its inner working by reading the following guides:

[**How Functions are executed**\\
\\
A deep dive into Inngest's Durable Execution Engine with a step-by-step workflow run example.](https://www.inngest.com/docs/learn/how-functions-are-executed) [**Thinking in Steps**\\
\\
Discover by example how steps enable more reliable and flexible functions with step-level error handling, conditional steps and waits.](https://www.inngest.com/docs/guides/multi-step-functions)

## [SDK References](https://www.inngest.com/docs/features/inngest-functions\#sdk-references)

[**TypeScript SDK**\\
\\
API reference](https://www.inngest.com/docs/reference/typescript) [**Python SDK**\\
\\
API reference](https://www.inngest.com/docs/reference/python) [**Go SDK**\\
\\
Go API reference](https://pkg.go.dev/github.com/inngest/inngestgo@v0.9.0/step)

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/inngest-functions.mdx)

[Previous](https://www.inngest.com/docs/guides/resend-webhook-events) [Handle Resend webhooks](https://www.inngest.com/docs/guides/resend-webhook-events)

[Next](https://www.inngest.com/docs/features/inngest-functions/steps-workflows) [Overview](https://www.inngest.com/docs/features/inngest-functions/steps-workflows)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)