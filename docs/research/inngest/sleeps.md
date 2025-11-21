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

- [Sleeps](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps#top)
- [How Sleeps work](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps#how-sleeps-work)
- [Pausing an execution for a given time](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps#pausing-an-execution-for-a-given-time)
- [Pausing an execution until a given date](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps#pausing-an-execution-until-a-given-date)

Features [Inngest Functions](https://www.inngest.com/docs/features/inngest-functions) [Steps & Workflows](https://www.inngest.com/docs/features/inngest-functions/steps-workflows)

# Sleeps

Two step methods, `step.sleep` and `step.sleepUntil`, are available to pause the execution of your function for a specific amount of time. Your function can sleep for seconds, minutes, or days, up to a maximum of one year.

Using sleep methods can avoid the need to run multiple cron jobs or use additional queues. For example, Sleeps enable you to create a user onboarding workflow that sequences multiple actions in time: first send a welcome email, then send a tutorial each day for a week.

## [How Sleeps work](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps\#how-sleeps-work)

`step.sleep` and `step.sleepUntil` tell Inngest to resume execution of your function at a future time. Your code doesn't need to be running during the sleep interval, allowing sleeps to be used in any environment, even serverless platforms.

A Function paused by a sleeping Step doesn't affect your account capacity; i.e. it does not count against your plan's concurrency limit. A sleeping Function doesn't count against any [concurrency policy](https://www.inngest.com/docs/guides/concurrency) you've set on the function, either.

TypeScriptGoPython

## [Pausing an execution for a given time](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps\#pausing-an-execution-for-a-given-time)

Use `step.sleep()` to pause the execution of your function for a specific amount of time.

CopyCopied

```ts
export default inngest.createFunction(
  { id: "send-delayed-email" },
  { event: "app/user.signup" },
  async ({ event, step }) => {
    await step.sleep("wait-a-couple-of-days", "2d");
    // Do something else
  }
);
```

Check out the [`step.sleep()` TypeScript reference.](https://www.inngest.com/docs/reference/functions/step-sleep)

## [Pausing an execution until a given date](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps\#pausing-an-execution-until-a-given-date)

Use `step.sleepUntil()` to pause the execution of your function until a specific date time.

CopyCopied

```ts
export default inngest.createFunction(
  { id: "send-scheduled-reminder" },
  { event: "app/reminder.scheduled" },
  async ({ event, step }) => {
    const date = new Date(event.data.remind_at);
    await step.sleepUntil("wait-for-scheduled-reminder", date);
    // Do something else
  }
);
```

Check out the [`step.sleepUntil()` TypeScript reference.](https://www.inngest.com/docs/reference/functions/step-sleep-until)

**Sleeps and trace/log history**

You may notice that Inngest Cloud's Function Runs view doesn't show function runs that use sleeps longer than your [Inngest plan's](https://www.inngest.com/pricing?ref=docs-sleeps) trace & log history limit, even though the functions are still sleeping and will continue to run as expected. **This is a known limitation** in our current dashboard and we're working to improve it.

In the meantime:

- Rest assured that your sleeping functions _are_ still sleeping and will resume as scheduled, even if they're not visible in the Function Runs list.
- Given a function run's ID, you can inspect its status using Inngest Cloud's Quick Search feature (Ctrl-K or ⌘K) or the [REST API](https://api-docs.inngest.com/docs/inngest-api/).

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/inngest-functions/steps-workflows/sleeps.mdx)

[Previous](https://www.inngest.com/docs/guides/multi-step-functions) [Function steps](https://www.inngest.com/docs/guides/multi-step-functions)

[Next](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event) [Wait for events](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)