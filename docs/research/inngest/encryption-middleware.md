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

- [Encryption Middleware](https://www.inngest.com/docs/features/middleware/encryption-middleware#top)
- [Installation](https://www.inngest.com/docs/features/middleware/encryption-middleware#installation)
- [Changing the encrypted event.data field](https://www.inngest.com/docs/features/middleware/encryption-middleware#changing-the-encrypted-event-data-field)
- [Decrypt only mode](https://www.inngest.com/docs/features/middleware/encryption-middleware#decrypt-only-mode)
- [Fallback decryption keys](https://www.inngest.com/docs/features/middleware/encryption-middleware#fallback-decryption-keys)
- [Cross-language support](https://www.inngest.com/docs/features/middleware/encryption-middleware#cross-language-support)

Features [Middleware](https://www.inngest.com/docs/features/middleware)

# Encryption Middleware

Encryption middleware provides end-to-end encryption for events, step output, and function output. **Only encrypted data is sent to Inngest servers**: encryption and decryption happen within your infrastructure.

TypeScript (v2.0.0+)Python (v0.3.0+)

## [Installation](https://www.inngest.com/docs/features/middleware/encryption-middleware\#installation)

Install the [`@inngest/middleware-encryption` package](https://www.npmjs.com/package/@inngest/middleware-encryption) ( [GitHub](https://github.com/inngest/inngest-js/tree/main/packages/middleware-encryption#readme)) and configure it as follows:

CopyCopied

```ts
import { encryptionMiddleware } from "@inngest/middleware-encryption";

// Initialize the middleware
const mw = encryptionMiddleware({
  // your encryption key string should not be hard coded
  key: process.env.MY_ENCRYPTION_KEY,
});

// Use the middleware with Inngest
const inngest = new Inngest({
  id: "my-app",
  middleware: [mw],
});
```

By default, the following will be encrypted:

- All step data
- All function output
- Event data placed inside `data.encrypted`

## [Changing the encrypted `event.data` field](https://www.inngest.com/docs/features/middleware/encryption-middleware\#changing-the-encrypted-event-data-field)

Only select pieces of event data are encrypted. By default, only the data.encrypted field.

This can be customized using the `eventEncryptionField: string` setting.

## [Decrypt only mode](https://www.inngest.com/docs/features/middleware/encryption-middleware\#decrypt-only-mode)

To disable encryption but continue decrypting, set `decryptOnly: true`. This is useful when you want to migrate away from encryption but still need to process older events.

## [Fallback decryption keys](https://www.inngest.com/docs/features/middleware/encryption-middleware\#fallback-decryption-keys)

To attempt decryption with multiple keys, set the `fallbackDecryptionKeys` parameter. This is useful when rotating keys, since older events may have been encrypted with a different key:

CopyCopied

```ts
// start out with the current key
encryptionMiddleware({
  key: process.env.MY_ENCRYPTION_KEY,
});

// deploy all services with the new key as a decryption fallback
encryptionMiddleware({
  key: process.env.MY_ENCRYPTION_KEY,
  fallbackDecryptionKeys: ["new"],
});

// deploy all services using the new key for encryption
encryptionMiddleware({
  key: process.env.MY_ENCRYPTION_KEY_V2,
  fallbackDecryptionKeys: ["current"],
});

// once you are sure all data using the "current" key has passed, phase it out
encryptionMiddleware({
  key: process.env.MY_ENCRYPTION_KEY_V2,
});
```

## [Cross-language support](https://www.inngest.com/docs/features/middleware/encryption-middleware\#cross-language-support)

This middleware is compatible with our encryption middleware in our TypeScript SDK. Encrypted events can be sent from Python and decrypted in TypeScript, and vice versa.

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/middleware/encryption-middleware.mdx)

[Previous](https://www.inngest.com/docs/features/middleware/dependency-injection) [Dependency Injection](https://www.inngest.com/docs/features/middleware/dependency-injection)

[Next](https://www.inngest.com/docs/features/middleware/sentry-middleware) [Sentry Middleware](https://www.inngest.com/docs/features/middleware/sentry-middleware)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)