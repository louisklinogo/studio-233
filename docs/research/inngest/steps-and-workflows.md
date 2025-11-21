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

- [Steps & Workflows](https://www.inngest.com/docs/features/inngest-functions/steps-workflows#top)
- [How steps work](https://www.inngest.com/docs/features/inngest-functions/steps-workflows#how-steps-work)
- [SDK References](https://www.inngest.com/docs/features/inngest-functions/steps-workflows#sdk-references)

Features [Inngest Functions](https://www.inngest.com/docs/features/inngest-functions)

# Steps & Workflows

Steps are fundamental building blocks of Inngest, turning your Inngest Functions into reliable workflows that can runs for months and recover from failures.

[**Thinking in Steps**\\
\\
Discover by example how steps enable more reliable and flexible functions with step-level error handling, conditional steps and waits.](https://www.inngest.com/docs/guides/multi-step-functions)

Once you are familiar with Steps, start adding new capabilities to your Inngest Functions:

[**Add sleeps**\\
\\
Enable your Inngest Functions to pause by waiting from minutes to months.](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps) [**Wait for events**\\
\\
Write functions that react to incoming events.](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event) [**Loop over steps**\\
\\
Iterate over large datasets by looping with steps.](https://www.inngest.com/docs/guides/working-with-loops) [**Parallelize steps**\\
\\
Discover how to apply the map-reduce pattern with Steps.](https://www.inngest.com/docs/guides/step-parallelism)

## [How steps work](https://www.inngest.com/docs/features/inngest-functions/steps-workflows\#how-steps-work)

You might wonder: how do Steps work? Why doesn't an Inngest Function get timed out when running on a Serverless environment?

You can think of steps as an API for expressing checkpoints in your workflow, such as waits or work that might benefit from retries or parallelism:

TypeScriptPythonGo

CopyCopied

```ts
inngest.createFunction(
  { id: "sync-systems" },
  { event: "auto/sync.request" },
  async ({ step }) => {
    // By wrapping code in step.run, the code will be retried if it throws an error and when successfuly.
    // It's result is saved to prevent unnecessary re-execution
    const data = await step.run("get-data", async () => {
      return getDataFromExternalSource();
    });

    // Can also be retried up to 4 times
    await step.run("save-data", async () => {
      return db.syncs.insertOne(data);
    });
  },
);
```

Each step execution relies on a communication with Inngest's [Durable Execution Engine](https://www.inngest.com/docs/learn/how-functions-are-executed) which is responsible to:

- Invoking Functions with the correct steps state (current step + previous steps data)
- Gather each step result and schedule the next step to perform

![Each Inngest Functions's step invocation implies a communication between your application and the Inngest Platform. The illustration shows how each step results in two requests to the deployed application.](https://www.inngest.com/_next/image?url=%2Fassets%2Fdocs%2Ffeatures%2Finngest-functions%2Fsteps-workflows%2FDurable-Execution-Engine-steps-light.jpg&w=3840&q=75)![Each Inngest Functions's step invocation implies a communication between your application and the Inngest Platform. The illustration shows how each step results in two requests to the deployed application.](https://www.inngest.com/_next/image?url=%2Fassets%2Fdocs%2Ffeatures%2Finngest-functions%2Fsteps-workflows%2FDurable-Execution-Engine-steps-dark.jpg&w=3840&q=75)

This architecture powers the durability of Inngest Functions with retriable steps and waits from hours to months. Also, when used in a serverless environment, steps benefit from an extended max duration, enabling workflows that both span over months and run for more than 5 minutes!

Explore the following guide for a step-by-step overview of a complete workflow run:

[**How Functions are executed**\\
\\
A deep dive into Inngest's Durable Execution Engine with a step-by-step workflow run example.](https://www.inngest.com/docs/learn/how-functions-are-executed)

## [SDK References](https://www.inngest.com/docs/features/inngest-functions/steps-workflows\#sdk-references)

[**TypeScript SDK**\\
\\
Steps API reference](https://www.inngest.com/docs/reference/functions/step-run) [**Python SDK**\\
\\
Steps API reference](https://www.inngest.com/docs/reference/python/steps/invoke) [**Go SDK**\\
\\
Steps API reference](https://pkg.go.dev/github.com/inngest/inngestgo@v0.9.0/step)

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/inngest-functions/steps-workflows.mdx)

[Previous](https://www.inngest.com/docs/features/inngest-functions) [Overview](https://www.inngest.com/docs/features/inngest-functions)

[Next](https://www.inngest.com/docs/guides/multi-step-functions) [Function steps](https://www.inngest.com/docs/guides/multi-step-functions)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)