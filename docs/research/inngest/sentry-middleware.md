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

- [Overview](https://www.inngest.com/docs/features/middleware)
- [Creating middleware](https://www.inngest.com/docs/features/middleware/create)
- Patterns
- [Dependency Injection](https://www.inngest.com/docs/features/middleware/dependency-injection)
- Built-in middlewares
- [Encryption Middleware](https://www.inngest.com/docs/features/middleware/encryption-middleware)
- [Sentry Middleware](https://www.inngest.com/docs/features/middleware/sentry-middleware)

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

- [Sentry Middleware](https://www.inngest.com/docs/features/middleware/sentry-middleware#top)
- [Installation](https://www.inngest.com/docs/features/middleware/sentry-middleware#installation)

Features [Middleware](https://www.inngest.com/docs/features/middleware)

# Sentry Middleware

Using the Sentry middleware is useful to:

- Capture exceptions for reporting
- Add tracing to each function run
- Include useful context for each exception and trace like function ID and event names

## [Installation](https://www.inngest.com/docs/features/middleware/sentry-middleware\#installation)

TypeScript (v3.0.0+)Python (v0.3.0+)

Install the [`@inngest/middleware-sentry` package](https://www.npmjs.com/package/@inngest/middleware-sentry) and configure it as follows:

CopyCopied

```ts
import * as Sentry from "@sentry/node";
import { Inngest } from "inngest";
import { sentryMiddleware } from "@inngest/middleware-sentry";

// Initialize Sentry as usual wherever is appropriate
Sentry.init(...);

const inngest = new Inngest({
  id: "my-app",
  middleware: [sentryMiddleware()],
});
```

Requires inngest@>=3.0.0 and @sentry/\*@>=8.0.0\`.

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/middleware/sentry-middleware.mdx)

[Previous](https://www.inngest.com/docs/features/middleware/encryption-middleware) [Encryption Middleware](https://www.inngest.com/docs/features/middleware/encryption-middleware)

[Next](https://www.inngest.com/docs/platform/deployment) [Overview](https://www.inngest.com/docs/platform/deployment)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)