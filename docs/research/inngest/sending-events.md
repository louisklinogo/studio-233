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

- [Sending events](https://www.inngest.com/docs/events#top)
- [Setting an Event Key](https://www.inngest.com/docs/events#setting-an-event-key)
- [Event payload format](https://www.inngest.com/docs/events#event-payload-format)
- [Sending multiple events at once](https://www.inngest.com/docs/events#sending-multiple-events-at-once)
- [Sending events from within functions](https://www.inngest.com/docs/events#sending-events-from-within-functions)
- [Using Event IDs](https://www.inngest.com/docs/events#using-event-ids)
- [Sending events from within functions](https://www.inngest.com/docs/events#sending-events-from-within-functions-2)
- [Using Event IDs](https://www.inngest.com/docs/events#using-event-ids-2)
- [Using Event IDs](https://www.inngest.com/docs/events#using-event-ids-3)
- [Send events via HTTP (Event API)](https://www.inngest.com/docs/events#send-events-via-http-event-api)
- [Deduplication](https://www.inngest.com/docs/events#deduplication)
- [Further reading](https://www.inngest.com/docs/events#further-reading)

Features [Events & Triggers](https://www.inngest.com/docs/features/events-triggers)

# Sending events

To start, make sure you have [installed the Inngest SDK](https://www.inngest.com/docs/sdk/overview).

In order to send events, you'll need to instantiate the `Inngest` client. We recommend doing this in a single file and exporting the client so you can import it anywhere in your app. In production, you'll need an event key, which [we'll cover below](https://www.inngest.com/docs/events#setting-an-event-key).

TypeScriptGoPython

### `inngest/client.ts`

CopyCopied

```ts
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "acme-storefront-app" }); // Use your app's ID
```

Now with this client, you can send events from anywhere in your app. You can send a single event, or [multiple events at once](https://www.inngest.com/docs/events#sending-multiple-events-at-once).

### `app/api/checkout/route.ts`

CopyCopied

```ts
import { inngest } from "../inngest/client";

// This sends an event to Inngest.
await inngest.send({
  // The event name
  name: "storefront/cart.checkout.completed",
  // The event's data
  data: {
    cartId: "ed12c8bde",
    itemIds: ["9f08sdh84", "sdf098487", "0fnun498n"],
    account: {
      id: 123,
      email: "test@example.com",
    },
  },
});
```

👉 `send()` is an asynchronous method that returns a `Promise`. You should always use `await` or `.then()` to ensure that the method has finished sending the event to Inngest. Serverless functions can shut down very quickly, so skipping `await` may result in events failing to be sent.

Sending this event, named `storefront/cart.checkout.completed`, to Inngest will do two things:

1. Automatically run any [functions](https://www.inngest.com/docs/functions) that are triggered by this specific event, passing the event payload to the function's arguments.
2. Store the event payload in Inngest cloud. You can find this in the **Events** tab of the dashboard.

💡 One event can trigger multiple functions, enabling you to consume a single event in multiple ways. This is different than traditional message queues where only one worker can consume a single message. Learn about [the fan-out approach here](https://www.inngest.com/docs/guides/fan-out-jobs).

## [Setting an Event Key](https://www.inngest.com/docs/events\#setting-an-event-key)

In production, your application will need an "Event Key" to send events to Inngest. This is a secret key that is used to authenticate your application and ensure that only your application can send events to a given [environment](https://www.inngest.com/docs/platform/environments) in your Inngest account.

You can learn [how to create an Event Key here](https://www.inngest.com/docs/events/creating-an-event-key). Once you have a key, you can set it in one of two ways:

1. Set an `INNGEST_EVENT_KEY` environment variable with your Event Key. **This is the recommended approach.**
2. Pass the Event Key to the `Inngest` constructor as the `eventKey` option:

### `inngest/client.ts`

CopyCopied

```ts
import { Inngest } from "inngest";

// NOTE - It is not recommended to hard-code your Event Key in your code.
const inngest = new Inngest({ id: "your-app-id", eventKey: "xyz..." });
```

Event keys are _not_ required in local development with the [Inngest Dev Server](https://www.inngest.com/docs/local-development). You can omit them in development and your events will still be sent to the Dev Server.

## [Event payload format](https://www.inngest.com/docs/events\#event-payload-format)

The event payload is a JSON object that must contain a `name` and `data` property.

Explore all events properties in the [Event payload format guide](https://www.inngest.com/docs/features/events-triggers/event-format).

## [Sending multiple events at once](https://www.inngest.com/docs/events\#sending-multiple-events-at-once)

You can also send multiple events in a single `send()` call. This enables you to send a batch of events very easily. You can send up to `512kb` in a single request which means you can send anywhere between 10 and 1000 typically sized payloads at once. This is the default and can be increased for your account.

CopyCopied

```ts
await inngest.send([\
  { name: "storefront/cart.checkout.completed", data: { ... } },\
  { name: "storefront/coupon.used", data: { ... } },\
  { name: "storefront/loyalty.program.joined", data: { ... } },\
])
```

This is especially useful if you have an array of data in your app and you want to send an event for each item in the array:

CopyCopied

```ts
// This function call might return 10s or 100s of items, so we can use map
// to transform the items into event payloads then pass that array to send:
const importedItems = await api.fetchAllItems();
const events = importedItems.map((item) => ({
  name: "storefront/item.imported",
  data: {
    ...item,
  }
}));
await inngest.send(events);
```

## [Sending events from within functions](https://www.inngest.com/docs/events\#sending-events-from-within-functions)

You can also send events from within your functions using `step.sendEvent()` to, for example, trigger other functions. Learn more about [sending events from within functions](https://www.inngest.com/docs/guides/sending-events-from-functions). Within functions, `step.sendEvent()` wraps the event sending request within a `step` to ensure reliable event delivery and prevent duplicate events from being sent. We recommend using `step.sendEvent()` instead of `inngest.send()` within functions.

CopyCopied

```ts
export default inngest.createFunction(
  { id: "user-onboarding" },
  { event: "app/user.signup" },
  async ({ event, step }) => {
    // Do something
    await step.sendEvent("send-activation-event", {
      name: "app/user.activated",
      data: { userId: event.data.userId },
    });
    // Do something else
  }
);
```

## [Using Event IDs](https://www.inngest.com/docs/events\#using-event-ids)

Each event sent to Inngest is assigned a unique Event ID. These `ids` are returned from `inngest.send()` or `step.sendEvent()`. Event IDs can be used to look up the event in the Inngest dashboard or via [the REST API](https://api-docs.inngest.com/docs/inngest-api/pswkqb7u3obet-get-an-event). You can choose to log or save these Event IDs if you want to look them up later.

CopyCopied

```ts
const { ids } = await inngest.send([\
  {\
    name: "app/invoice.created",\
    data: { invoiceId: "645e9e024befa68763f5b500" }\
  },\
  {\
    name: "app/invoice.created",\
    data: { invoiceId: "645e9e08f29fb563c972b1f7" }\
  },\
]);
/**
 * ids = [\
 *   "01HQ8PTAESBZPBDS8JTRZZYY3S",\
 *   "01HQ8PTFYYKDH1CP3C6PSTBZN5"\
 * ]
 */
```

## [Send events via HTTP (Event API)](https://www.inngest.com/docs/events\#send-events-via-http-event-api)

You can send events from any system or programming language with our API and an Inngest Event Key. The API accepts a single event payload or an array of event payloads.

To send an event to a specific [branch environment](https://www.inngest.com/docs/platform/environments#branch-environments), set the `x-inngest-env` header to the name of your branch environment, for example: `x-inngest-env: feature/my-branch`.

cURLPHP

POST

inn.gs/e/:eventKey

CopyCopied

```bash
curl -X POST https://inn.gs/e/$INNGEST_EVENT_KEY \
  -H 'Content-Type: application/json' \
  --data '{
    "name": "user.signup",
    "data": {
      "userId": "645ea8289ad09eac29230442"
    }
  }'
```

When using the [dev server](https://www.inngest.com/docs/dev-server), use `http://localhost:8288/e/<fake-key>` as the endpoint. If [self-hosting](https://www.inngest.com/docs/self-hosting), replace with the url for your self-hosted instance.

The response will contain the `ids` of the events that were sent:

### Response

CopyCopied

```json
{
  "ids": ["01H08W4TMBNKMEWFD0TYC532GG"],
  "status": 200
}
```

## [Deduplication](https://www.inngest.com/docs/events\#deduplication)

Often, you may need to prevent duplicate events from being processed by Inngest. If your system could possibly send the same event more than once, you will want to ensure that it does not run functions more than once.

To prevent duplicate function runs from events, you can add an `id` parameter to the event payload. Once Inngest receives an event with an `id`, any events sent with the same `id` will be ignored, regardless of the event's payload.

CopyCopied

```ts
await inngest.send({
  // Your deduplication id must be specific to this event payload.
  // Use something that will not be used across event types, not a generic value like cartId
  id: "cart-checkout-completed-ed12c8bde",
  name: "storefront/cart.checkout.completed",
  data: {
    cartId: "ed12c8bde",
    // ...the rest of the payload's data...
  }
});
```

Learn more about this in the [handling idempotency guide](https://www.inngest.com/docs/guides/handling-idempotency).

💡 Deduplication prevents duplicate function runs for 24 hours from the first event.

The `id` is global across all event types, so make sure your `id` isn't a value that will be shared across different event types.

For example, for two events like `storefront/item.imported` and `storefront/item.deleted`, do not use the `item`'s `id` (`9f08sdh84`) as the event deduplication `id`. Instead, combine the item's `id` with the event type to ensure it's specific to that event (e.g. `item-imported-9f08sdh84`).

## [Further reading](https://www.inngest.com/docs/events\#further-reading)

- [Creating an Event Key](https://www.inngest.com/docs/events/creating-an-event-key)
- [TypeScript SDK Reference: Send events](https://www.inngest.com/docs/reference/events/send)
- [Python SDK Reference: Send events](https://www.inngest.com/docs/reference/python/client/send)
- [Go SDK Reference: Send events](https://pkg.go.dev/github.com/inngest/inngestgo#Client)

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/events/index.mdx)

[Previous](https://www.inngest.com/docs/features/events-triggers) [Overview](https://www.inngest.com/docs/features/events-triggers)

[Next](https://www.inngest.com/docs/features/events-triggers/event-format) [Event payload format](https://www.inngest.com/docs/features/events-triggers/event-format)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)