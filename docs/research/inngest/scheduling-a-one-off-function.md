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

- [Scheduling a one-off function](https://www.inngest.com/docs/examples/scheduling-one-off-function#top)
- [Quick Snippet](https://www.inngest.com/docs/examples/scheduling-one-off-function#quick-snippet)
- [Triggering the function with a timestamp](https://www.inngest.com/docs/examples/scheduling-one-off-function#triggering-the-function-with-a-timestamp)
- [Alternatives](https://www.inngest.com/docs/examples/scheduling-one-off-function#alternatives)
- [More context](https://www.inngest.com/docs/examples/scheduling-one-off-function#more-context)
- [Related concepts](https://www.inngest.com/docs/examples/scheduling-one-off-function#related-concepts)

[Examples](https://www.inngest.com/docs/examples)

# Scheduling a one-off function

Inngest provides a way to delay a function run to a specific time in the future. This is useful when:

- You want to schedule work in the future based on user input.
- You want to slightly delay execution of a non-urgent function for a few seconds or minutes.

This page provides a quick example of how to delay a function run to a specific time in the future using the [event payload's](https://www.inngest.com/docs/events#event-payload-format)`ts` field.

## [Quick Snippet](https://www.inngest.com/docs/examples/scheduling-one-off-function\#quick-snippet)

Here is a basic function that sends a reminder to a user at a given email.

CopyCopied

```typescript
const sendReminder = inngest.createFunction(
  { id: "send-reminder" },
  { event: "notifications/reminder.scheduled" },
  async ({ event, step }) => {
    const { user, message } = event.data;

    const { id } = await emailApi.send({
      to: user.email,
      subject: "Reminder for your upcoming event",
      body: message,
    });

    return { id }
  }
);
```

### [Triggering the function with a timestamp](https://www.inngest.com/docs/examples/scheduling-one-off-function\#triggering-the-function-with-a-timestamp)

To trigger this function, you will send an event `"notifications/reminder.scheduled"` using `inngest.send()` with the necessary data. The `ts` field in the [event payload](https://www.inngest.com/docs/events#event-payload-format) should be set to the Unix timestamp of the time you want the function to run. For example, to schedule a reminder for 5 minutes in the future:

CopyCopied

```typescript
await inngest.send({
  name: "notifications/reminder.scheduled",
  data: {
    user: { email: "johnny.utah@fbi.gov" }
    message: "Don't forget to catch the wave at 3pm",
  },
  // Include the timestamp for 5 minutes in the future:
  ts: Date.now() + 5 * 60 * 1000,
});
```

⚠️ Providing a timestamp in the event only applies for starting function runs. Functions waiting for a matching event will immediately resume, regardless of the timestamp.

### [Alternatives](https://www.inngest.com/docs/examples/scheduling-one-off-function\#alternatives)

Depending on your use case, you may want to consider using [scheduled functions (cron jobs)](https://www.inngest.com/docs/guides/scheduled-functions) for scheduling periodic work or use [`step.sleepUntil()`](https://www.inngest.com/docs/reference/functions/step-sleep-until) to add mid-function delays for a layer time.

## [More context](https://www.inngest.com/docs/examples/scheduling-one-off-function\#more-context)

Check the resources below to learn more about scheduling functions with Inngest.

[**Guide: Sending events** \\
\\
Learn how to send events to trigger functions in Inngest.](https://www.inngest.com/docs/events)

## [Related concepts](https://www.inngest.com/docs/examples/scheduling-one-off-function\#related-concepts)

- [Scheduled functions (cron jobs)](https://www.inngest.com/docs/guides/scheduled-functions)
- [`step.sleepUntil()`](https://www.inngest.com/docs/reference/functions/step-sleep-until)

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/examples/scheduling-one-off-function.mdx)

[Previous](https://www.inngest.com/docs/examples/email-sequence) [Email Sequence](https://www.inngest.com/docs/examples/email-sequence)

[Next](https://www.inngest.com/docs/examples/fetch-run-status-and-output) [Fetch run status and output](https://www.inngest.com/docs/examples/fetch-run-status-and-output)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)