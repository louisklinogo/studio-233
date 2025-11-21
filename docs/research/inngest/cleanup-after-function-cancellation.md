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

- [Cleanup after function cancellation](https://www.inngest.com/docs/examples/cleanup-after-function-cancellation#top)
- [Quick snippet](https://www.inngest.com/docs/examples/cleanup-after-function-cancellation#quick-snippet)
- [More context](https://www.inngest.com/docs/examples/cleanup-after-function-cancellation#more-context)

[Examples](https://www.inngest.com/docs/examples)

# Cleanup after function cancellation

When function runs are cancelled, you may want to perform some sort of post-cancellation code. This example will use the [`inngest/function.cancelled`](https://www.inngest.com/docs/reference/system-events/inngest-function-cancelled) system event.

Whether your function run is cancelled via [`cancelOn` event](https://www.inngest.com/docs/features/inngest-functions/cancellation/cancel-on-events), [REST API](https://www.inngest.com/docs/guides/cancel-running-functions) or [bulk cancellation](https://www.inngest.com/docs/platform/manage/bulk-cancellation), this method will work the same.

## [Quick snippet](https://www.inngest.com/docs/examples/cleanup-after-function-cancellation\#quick-snippet)

Here is an Inngest function and a corresponding function that will be run whenever the original function is cancelled. This uses the function trigger's `if` parameter to filter the `inngest/function.cancelled` event to only be triggered for the original function.

CopyCopied

```ts
const inngest = new Inngest({ id: "newsletter-app" });

// This is our "import" function that will get cancelled
export const importAllContacts = inngest.createFunction(
  {
    id: "import-all-contacts",
    cancelOn: [{ event: "contacts/import.cancelled", if: "async.data.importId == event.data.importId" }]
  },
  { event: "contacts/import.requested" },
  async ({ event, step  }) => {
    // This is a long running function
  }
)

// This function will be run only when the matching function_id has a run that is cancelled
export const cleanupCancelledImport = inngest.createFunction(
  {
    name: "Cleanup cancelled import",
    id: "cleanup-cancelled-import"
  },
  {
    event: "inngest/function.cancelled",
    // The function ID is a hyphenated slug of the App ID w/ the functions" id
    if: "event.data.function_id == 'newsletter-app-import-all-contacts'"
  },
  async ({ event, step, logger }) => {
    // This code will execute after your function is cancelled

    // The event that triggered our original function run is passed nested in our event payload
    const originalTriggeringEvent = event.data.event;
    logger.info(`Import was cancelled: ${originalTriggeringEvent.data.importId}`)
  }
);
```

An example cancellation event payload:

CopyCopied

```json
{
  "name": "inngest/function.cancelled",
  "data": {
    "error": {
      "error": "function cancelled",
      "message": "function cancelled",
      "name": "Error"
    },
    "event": {
      "data": {
        "importId": "bdce1b1b-6e3a-43e6-84c2-2deb559cdde6"
      },
      "id": "01JDJK451Y9KFGE5TTM2FHDEDN",
      "name": "contacts/import.requested",
      "ts": 1732558407003,
      "user": {}
    },
    "events": [\
      {\
        "data": {\
          "importId": "bdce1b1b-6e3a-43e6-84c2-2deb559cdde6"\
        },\
        "id": "01JDJK451Y9KFGE5TTM2FHDEDN",\
        "name": "contacts/import.requested",\
        "ts": 1732558407003,\
        "user": {}\
      }\
    ],
    "function_id": "newsletter-app-import-all-contacts",
    "run_id": "01JDJKGTGDVV4DTXHY6XYB7BKK"
  },
  "id": "01JDJKH1S5P2YER8PKXPZJ1YZJ",
  "ts": 1732570023717
}
```

## [More context](https://www.inngest.com/docs/examples/cleanup-after-function-cancellation\#more-context)

Check the resources below to learn more about building email sequences with Inngest.

[**Reference: inngest/function.cancelled system event** \\
\\
Learn more about the system event.](https://www.inngest.com/docs/reference/system-events/inngest-function-cancelled)

[**Guide: Function cancellation** \\
\\
Learn about the different ways to cancel a function run.](https://www.inngest.com/docs/features/inngest-functions/cancellation)

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/examples/cleanup-after-function-cancellation.mdx)

[Previous](https://www.inngest.com/docs/examples/track-failures-in-datadog) [Track all function failures in Datadog](https://www.inngest.com/docs/examples/track-failures-in-datadog)

[Next](https://www.inngest.com/docs/examples/fetch) [Fetch: Durable HTTP requests](https://www.inngest.com/docs/examples/fetch)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)