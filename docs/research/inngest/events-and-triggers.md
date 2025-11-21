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

- [Overview](https://www.inngest.com/docs/features/events-triggers)
- Essentials
- [Sending events](https://www.inngest.com/docs/events)
- [Event payload format](https://www.inngest.com/docs/features/events-triggers/event-format)
- [Crons](https://www.inngest.com/docs/guides/scheduled-functions)
- [Delayed functions](https://www.inngest.com/docs/guides/delayed-functions)
- [Direct invocation](https://www.inngest.com/docs/guides/invoking-functions-directly)
- [Webhooks](https://www.inngest.com/docs/platform/webhooks)
- Patterns
- [Background jobs](https://www.inngest.com/docs/guides/background-jobs)
- [Fan out](https://www.inngest.com/docs/guides/fan-out-jobs)
- [Multiple triggers & wildcards](https://www.inngest.com/docs/guides/multiple-triggers)
- [Sending events from functions](https://www.inngest.com/docs/guides/sending-events-from-functions)
- [Batching events](https://www.inngest.com/docs/guides/batching)
- [Writing expression](https://www.inngest.com/docs/guides/writing-expressions)
- Integrations
- [Neon](https://www.inngest.com/docs/features/events-triggers/neon)
- Use cases
- [Handle Clerk webhooks](https://www.inngest.com/docs/guides/clerk-webhook-events)
- [Handle Resend webhooks](https://www.inngest.com/docs/guides/resend-webhook-events)

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

- [Events & Triggers](https://www.inngest.com/docs/features/events-triggers#top)
- [Why events?](https://www.inngest.com/docs/features/events-triggers#why-events)
- [Learn more about Events](https://www.inngest.com/docs/features/events-triggers#learn-more-about-events)

Features

# Events & Triggers

Inngest functions are triggered asynchronously by **events** coming from various sources, including:

[**Your application**\\
\\
Send an event from your application’s backend with the Inngest SDK.](https://www.inngest.com/docs/events) [**Cron schedule**\\
\\
Run an Inngest function periodically with a trigger using cron syntax.](https://www.inngest.com/docs/guides/scheduled-functions) [**Webhook events**\\
\\
Use Inngest as a webhook consumer for any service to trigger functions.](https://www.inngest.com/docs/platform/webhooks) [**Another Inngest function**\\
\\
Directly invoke other functions to compose more powerful functions.](https://www.inngest.com/docs/guides/invoking-functions-directly)

You can customize each of these triggers in multiple ways:

- **[Filtering event triggers](https://www.inngest.com/docs/guides/writing-expressions)** \- Trigger a function for a subset of matching events sent.
- **[Delaying execution](https://www.inngest.com/docs/guides/delayed-functions)** \- Trigger a function to run at a specific timestamp in the future.
- **[Batching events](https://www.inngest.com/docs/guides/batching)** \- Process multiple events in a single function for more efficient systems.
- **[Multiple triggers](https://www.inngest.com/docs/guides/multiple-triggers)** \- Use a single function to handle multiple event types.

## [Why events?](https://www.inngest.com/docs/features/events-triggers\#why-events)

Using Events to trigger Inngest Functions instead of direct invocations offers a lot of flexibility:

- Events can trigger multiple Inngest Functions.
- Events can be used to synchronize Inngest Function runs with [cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation) and [“wait for event” step](https://www.inngest.com/docs/reference/functions/step-wait-for-event).
- Events can be leveraged to trigger Functions across multiple applications.
- Similar Events can be grouped together for faster processing.

Events act as a convenient mapping between your application actions (ex, `user.signup`) and your application's code (ex, `sendWelcomeEmail()` and `importContacts()`):

![Illustration of a demo application sending a "user.signup" event to the Inngest Platform which triggers two Inngest Functions: sendWelcomeEmail and importContacts.](https://www.inngest.com/_next/image?url=%2Fassets%2Fdocs%2Ffeatures%2Fevents-triggers%2Finngest-function-triggers-light.jpg&w=3840&q=75)![Illustration of a demo application sending a "user.signup" event to the Inngest Platform which triggers two Inngest Functions: sendWelcomeEmail and importContacts.](https://www.inngest.com/_next/image?url=%2Fassets%2Fdocs%2Ffeatures%2Fevents-triggers%2Finngest-function-triggers-dark.jpg&w=3840&q=75)

### [Learn more about Events](https://www.inngest.com/docs/features/events-triggers\#learn-more-about-events)

[**Blog post: How event Filtering works**\\
\\
Accidentally Quadratic: Evaluating trillions of event matches in real-time](https://www.inngest.com/blog/accidentally-quadratic-evaluating-trillions-of-event-matches-in-real-time) [**Blog post: Events in practice**\\
\\
Building an Event Driven Video Processing Workflow with Next.js, tRPC, and Inngest](https://www.inngest.com/blog/nextjs-trpc-inngest)

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/events-triggers.mdx)

[Previous](https://www.inngest.com/docs/guides/development-with-docker) [Development with Docker](https://www.inngest.com/docs/guides/development-with-docker)

[Next](https://www.inngest.com/docs/events) [Sending events](https://www.inngest.com/docs/events)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)