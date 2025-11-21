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

- [Creating middleware](https://www.inngest.com/docs/features/middleware/create#top)
- [Initialization](https://www.inngest.com/docs/features/middleware/create#initialization)
- [Specifying lifecycles and hooks](https://www.inngest.com/docs/features/middleware/create#specifying-lifecycles-and-hooks)
- [Adding configuration](https://www.inngest.com/docs/features/middleware/create#adding-configuration)
- [Next steps](https://www.inngest.com/docs/features/middleware/create#next-steps)

Features [Middleware](https://www.inngest.com/docs/features/middleware)

# Creating middleware

Creating middleware means defining the lifecycles and subsequent hooks in those lifecycles to run code in. Lifecycles are actions such as a function run or sending events, and individual hooks within those are where we run code, usually with a _before_ and _after_ step.

TypeScript (v2.0.0+)Python (v0.3.0+)

A Middleware is created using the `InngestMiddleware` class.

**`new InngestMiddleware(options): InngestMiddleware`**

CopyCopied

```ts
// Create a new middleware
const myMiddleware = new InngestMiddleware({
  name: "My Middleware",
  init: () => {
      return {};
  },
});

// Register it on the client
const inngest = new Inngest({
  id: "my-app",
  middleware: [myMiddleware],
});
```

## [Initialization](https://www.inngest.com/docs/features/middleware/create\#initialization)

As you can see above, we start with the `init` function, which is called when the client is initialized.

CopyCopied

```ts
import { InngestMiddleware } from "inngest";

new InngestMiddleware({
  name: "Example Middleware",
  init() {
    // This runs when the client is initialized
    // Use this to set up anything your middleware needs
    return {};
  },
});
```

Function registration, lifecycles, and hooks can all be with synchronous or `async` functions. This makes it easy for our initialization handler to do some async work, like setting up a database connection.

CopyCopied

```ts
new InngestMiddleware({
name: "Example Middleware",
async init() {
    const db = await connectToDatabase();

    return {};
},
});
```

All lifecycle and hook functions can be synchronous or `async` functions - the SDK will always wait until a middleware's function has resolved before continuing to the next one.

As it's possible for an application to use multiple Inngest clients, it's recommended to always initialize dependencies within the initializer function/method, instead of in the global scope.

## [Specifying lifecycles and hooks](https://www.inngest.com/docs/features/middleware/create\#specifying-lifecycles-and-hooks)

Notice we're returning an empty object `{}`. From here, we can instead return the lifecycles we want to use for this client. See the [Middleware - Lifecycle - Hook reference](https://www.inngest.com/docs/reference/middleware/lifecycle#hook-reference) for a full list of available hooks.

CopyCopied

```ts
new InngestMiddleware({
name: "Example Middleware",
async init() {
    // 1. Use init to set up dependencies
    // 2. Use return values to group hooks by lifecycle: - "onFunctionRun" "onSendEvent"
    return {
    onFunctionRun({ ctx, fn, steps }) {
        // 3. Use the lifecycle function to pass dependencies into hooks
        // 4. Return any hooks that you want to define for this action
        return {
        // 5. Define the hook that runs at a specific stage for this lifecycle.
        beforeExecution() {
            // 6. Define your hook
        },
        };
    },
    };
},
});
```

Here we use the `beforeExecution()` hook within the `onFunctionRun()` lifecycle.

The use of [closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) here means that our `onFunctionRun()` lifecycle can access anything from the middleware's initialization, like our `db` connection.

`onFunctionRun()` here is also called for every function execution, meaning you can run code specific to this execution without maintaining any global state. We can even conditionally register hooks based on incoming arguments. For example, here we only register a hook for a specific event trigger:

CopyCopied

```ts
new InngestMiddleware({
name: "Example Middleware",
async init() {
    return {
    onFunctionRun({ ctx, fn, steps }) {
        // Register a hook only if this event is the trigger
        if (ctx.event.name === "app/user.created") {
        return {
            beforeExecution() {
            console.log("Function executing with user created event");
            },
        };
        }

        // Register no hooks if the trigger was not `app/user.created`
        return {};
    },
    };
},
});
```

Learn more about hooks with:

- [Lifecycle](https://www.inngest.com/docs/reference/middleware/lifecycle) \- middleware ordering and see all available hooks
- [TypeScript](https://www.inngest.com/docs/reference/middleware/typescript) \- how to affect input and output types and values

## [Adding configuration](https://www.inngest.com/docs/features/middleware/create\#adding-configuration)

It's common for middleware to require additional customization or options from developers. For this, we recommend creating a function that takes in some options and returns the middleware.

### inngest/middleware/myMiddleware.ts

CopyCopied

```ts
import { InngestMiddleware } from "inngest";

export const createMyMiddleware = (logEventOutput: string) => {
return new InngestMiddleware({
    name: "My Middleware",
    init() {
    return {
        onFunctionRun({ ctx, fn, steps }) {
        if (ctx.event.name === logEventOutput) {
            return {
            transformOutput({ result, step }) {
                console.log(
                `${logEventOutput} output: ${JSON.stringify(result)}`
                );
            },
            };
        }

        return {};
        },
    };
    },
});
};
```

CopyCopied

```ts
import { createMyMiddleware } from "./middleware/myMiddleware";

export const inngest = new Inngest({
id: "my-client",
middleware: [createMyMiddleware("app/user.created")],
});
```

Make sure to let TypeScript infer the output of the function instead of strictly typing it; this helps Inngest understand changes to input and output of arguments. See [Middleware - TypeScript](https://www.inngest.com/docs/reference/middleware/typescript) for more information.

## [Next steps](https://www.inngest.com/docs/features/middleware/create\#next-steps)

Check out our pre-built middleware and examples:

[**Dependency Injection**\\
\\
Provide shared client instances (ex, OpenAI) to your Inngest Functions.](https://www.inngest.com/docs/features/middleware/dependency-injection) [**Encryption Middleware**\\
\\
End-to-end encryption for events, step output, and function output.](https://www.inngest.com/docs/features/middleware/encryption-middleware) [**Sentry Middleware**\\
\\
Quickly setup Sentry for your Inngest Functions.](https://www.inngest.com/docs/features/middleware/sentry-middleware) [**Datadog middleware**\\
\\
Add tracing with Datadog under a few minutes.](https://www.inngest.com/docs/examples/track-failures-in-datadog) [**Cloudflare Workers & Hono middleware**\\
\\
Access environment variables within Inngest functions.](https://www.inngest.com/docs/examples/middleware/cloudflare-workers-environment-variables)

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/middleware/create.mdx)

[Previous](https://www.inngest.com/docs/features/middleware) [Overview](https://www.inngest.com/docs/features/middleware)

[Next](https://www.inngest.com/docs/features/middleware/dependency-injection) [Dependency Injection](https://www.inngest.com/docs/features/middleware/dependency-injection)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)