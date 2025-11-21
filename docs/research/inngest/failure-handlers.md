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

- [Overview](https://www.inngest.com/docs/guides/error-handling)
- [Retries](https://www.inngest.com/docs/features/inngest-functions/error-retries/retries)
- [Rollbacks](https://www.inngest.com/docs/features/inngest-functions/error-retries/rollbacks)
- [Failure handlers](https://www.inngest.com/docs/features/inngest-functions/error-retries/failure-handlers)
- [Inngest errors](https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors)
- Guides
- [Handling idempotency](https://www.inngest.com/docs/guides/handling-idempotency)

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

- [Failure handlers](https://www.inngest.com/docs/features/inngest-functions/error-retries/failure-handlers#top)
- [Examples](https://www.inngest.com/docs/features/inngest-functions/error-retries/failure-handlers#top)

Features [Inngest Functions](https://www.inngest.com/docs/features/inngest-functions) [Errors & Retries](https://www.inngest.com/docs/guides/error-handling)

# Failure handlers TypeScript only

If your function exhausts all of its retries, it will be marked as "Failed." You can handle this circumstance by either providing an [`onFailure/on_failure`](https://www.inngest.com/docs/reference/functions/handling-failures) handler when defining your function, or by listening for the [`inngest/function.failed`](https://www.inngest.com/docs/reference/system-events/inngest-function-failed) system event.

The first approach is function-specific, while the second covers all function failures in a given Inngest environment.

# Examples

The example below checks if a user's subscription is valid a total of six times. If you can't check the subscription after all retries, you'll unsubscribe the user:

TypeScriptPythonGo

CopyCopied

```ts
/* Option 1: give the inngest function an `onFailure` handler. */
inngest.createFunction(
  {
    id: "update-subscription",
    retries: 5,
    onFailure: async ({ event, error }) => {
      // if the subscription check fails after all retries, unsubscribe the user
      await unsubscribeUser(event.data.userId);
    },
  },
  { event: "user/subscription.check" },
  async ({ event }) => { /* ... */ },
);
/* Option 2: Listens for the [`inngest/function.failed`](/docs/reference/functions/handling-failures#the-inngest-function-failed-event) system event to catch all failures in the inngest environment*/
inngest.createFunction(
  { id: "handle-any-fn-failure" },
  { event: "inngest/function.failed" },
  async ({ event }) => { /* ... */ },
);
```

To handle cancelled function runs, checkout out [this example](https://www.inngest.com/docs/examples/cleanup-after-function-cancellation) that uses the [`inngest/function.cancelled`](https://www.inngest.com/docs/reference/system-events/inngest-function-cancelled) system event.

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/inngest-functions/error-retries/failure-handlers.mdx)

[Previous](https://www.inngest.com/docs/features/inngest-functions/error-retries/rollbacks) [Rollbacks](https://www.inngest.com/docs/features/inngest-functions/error-retries/rollbacks)

[Next](https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors) [Inngest errors](https://www.inngest.com/docs/features/inngest-functions/error-retries/inngest-errors)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)