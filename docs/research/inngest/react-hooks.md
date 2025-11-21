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

- [Overview](https://www.inngest.com/docs/features/realtime)
- [React hooks / Next.js](https://www.inngest.com/docs/features/realtime/react-hooks)

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

- [React hooks / Next.js](https://www.inngest.com/docs/features/realtime/react-hooks#top)
- [useInngestSubscription() API Reference](https://www.inngest.com/docs/features/realtime/react-hooks#use-inngest-subscription-api-reference)
- [Parameters](https://www.inngest.com/docs/features/realtime/react-hooks#parameters)
- [Return value](https://www.inngest.com/docs/features/realtime/react-hooks#return-value)
- [Examples](https://www.inngest.com/docs/features/realtime/react-hooks#examples)

Features [Realtime](https://www.inngest.com/docs/features/realtime)

# React hooks / Next.js TypeScript SDK v3.32.0+

Realtime provides a [`useInngestSubscription()`](https://www.inngest.com/docs/features/realtime/react-hooks#use-inngest-subscription-api-reference) React hook, offering a fully typed experience for subscribing to channels.

`useInngestSubscription()` securely subscribes to channels using a subscription token fetched from the server.

In Next.js, this is implemented as a server action that returns a token, which is then used by the client to subscribe:

### `src/actions.ts`

CopyCopied

```tsx
"use server";
// securely fetch an Inngest Realtime subscription token from the server as a server action
export async function fetchSubscriptionToken(): Promise<Realtime.Token<typeof helloChannel, ["logs"]>> {
  const token = await getSubscriptionToken(getInngestApp(), {
    channel: helloChannel(),
    topics: ["logs"],
  });

  return token;
}
```

### `src/App.tsx`

CopyCopied

```tsx
"use client";

import { useInngestSubscription } from "@inngest/realtime/hooks";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";
import { getInngestApp } from "@/inngest";
import { helloChannel } from "@/inngest/functions/helloWorld";
// import the server action to securely fetch the Realtime subscription token
import { fetchRealtimeSubscriptionToken } from "./actions";

export default function Home() {
  // subscribe to the hello-world channel via the subscription token
  // `data` is fully typed based on the selected channel and topics!
  const { data, error } = useInngestSubscription({
    refreshToken: fetchRealtimeSubscriptionToken,
  });

  return (
    <div>
      <h1>Realtime</h1>
      {data.map((message, i) => (
        <div key={i}>{message.data}</div>
      ))}
    </div>
  )
}
```

## [`useInngestSubscription()` API Reference](https://www.inngest.com/docs/features/realtime/react-hooks\#use-inngest-subscription-api-reference)

### [Parameters](https://www.inngest.com/docs/features/realtime/react-hooks\#parameters)

- `enabled?: boolean` \- Whether or not the hook will subscribe.
- `bufferInterval?: number` \- If set and above `0`, the outputs will only update every `n` milliseconds. This helps with very busy streams that could overwhelm a UI.
- `token?: Realtime.Subscribe.Token` \- The token to be used for subscribing (see [Subscribe from the client](https://www.inngest.com/docs/features/realtime#subscribe-from-the-client)).
- `refreshToken?: () => Promise<Realtime.Subscribe.Token>` \- A function that will be called if no `token` is available, or if the hook has been re-`enabled` and the previous `token` has expired.

A `token` or `refreshToken` parameter is required.

### [Return value](https://www.inngest.com/docs/features/realtime/react-hooks\#return-value)

- `data: Array<Realtime.Message>` \- All messages received on the subscription in chronological order.
- `latestData: Realtime.Message` \- A shortcut to the last message received on the subscription. Useful for streams where each message is the latest state of an entity.
- `freshData: Array<Realtime.Message>` \- If `bufferInterval` is active, this will be the last batch of messages released from the buffer. If `bufferInterval` is inactive, this is always the latest message.
- `error: Error | null` \- If truthy, this indicates an error with the subscription.
- `state: InngestSubscriptionState` \- The current state of the subscription, one of `"closed"`, `"error"`, `"refresh_token"`, `"connecting"`, `"active"`, or `"closing"`.
- `clear: () => void` \- A function to clear all accumulated message data from the internal state. This includes `data`, `freshData`, and `latestData` arrays. Does not affect the connection or error state.

## [Examples](https://www.inngest.com/docs/features/realtime/react-hooks\#examples)

[**useInngestSubscription() Next.js demo**\\
\\
Clone this demo to see an interactive example of the `useInngestSubscription()` hook in action.](https://github.com/inngest/inngest-js/tree/main/examples/realtime/next-realtime-hooks) [**Explore patterns and examples**\\
\\
Use Realtime to stream updates from one or multiple Inngest functions, or to implement a Human-in-the-Loop mechanism.](https://www.inngest.com/docs/examples/realtime)

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/realtime/react-hooks.mdx)

[Previous](https://www.inngest.com/docs/features/realtime) [Overview](https://www.inngest.com/docs/features/realtime)

[Next](https://www.inngest.com/docs/features/middleware) [Overview](https://www.inngest.com/docs/features/middleware)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)