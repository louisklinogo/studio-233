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

Features [Inngest Functions](https://www.inngest.com/docs/features/inngest-functions) [Steps & Workflows](https://www.inngest.com/docs/features/inngest-functions/steps-workflows)

# Wait for an Event

One step method is available to pause a Function's run until a given event is sent.

This is a useful pattern to react to specific user actions (for example, implement "Human in the loop" in AI Agent workflows).

TypeScriptGoPython

Use `step.waitForEvent()` to wait for a particular event to be received before continuing. It returns a `Promise` that is resolved with the received event or `null` if the event is not received within the timeout.

CopyCopied

```ts
export default inngest.createFunction(
  { id: "send-onboarding-nudge-email" },
  { event: "app/account.created" },
  async ({ event, step }) => {
    const onboardingCompleted = await step.waitForEvent(
      "wait-for-onboarding-completion",
      { event: "app/onboarding.completed", timeout: "3d", match: "data.userId" }
    );
    if (!onboardingCompleted) {
      // if no event is received within 3 days, onboardingCompleted will be null
    } else {
      // if the event is received, onboardingCompleted will be the event payload object
    }
  }
);
```

Check out the [`step.waitForEvent()` TypeScript reference.](https://www.inngest.com/docs/reference/functions/step-wait-for-event)

To add a simple time based delay to your code, use [`step.sleep()`](https://www.inngest.com/docs/reference/functions/step-sleep) instead.

## [Examples](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event\#examples)

### [Dynamic functions that wait for additional user actions](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event\#dynamic-functions-that-wait-for-additional-user-actions)

Below is an example of an Inngest function that creates an Intercom or Customer.io-like drip email campaign, customized based on

CopyCopied

```ts
export default inngest.createFunction(
  { id: "onboarding-email-drip-campaign" },
  { event: "app/account.created" },
  async ({ event, step }) => {
    // Send the user the welcome email immediately
    await step.run("send-welcome-email", async () => {
      await sendEmail(event.user.email, "welcome");
    });

    // Wait up to 3 days for the user to complete the final onboarding step
    // If the event is received within these 3 days, onboardingCompleted will be the
    // event payload itself, if not it will be null
    const onboardingCompleted = await step.waitForEvent("wait-for-onboarding", {
      event: "app/onboarding.completed",
      timeout: "3d",
      // The "data.userId" must match in both the "app/account.created" and
      // the "app/onboarding.completed" events
      match: "data.userId",
    });

    // If the user has not completed onboarding within 3 days, send them a nudge email
    if (!onboardingCompleted) {
      await step.run("send-onboarding-nudge-email", async () => {
        await sendEmail(event.user.email, "onboarding_nudge");
      });
    } else {
      // If they have completed onboarding, send them a tips email
      await step.run("send-tips-email", async () => {
        await sendEmail(event.user.email, "new_user_tips");
      });
    }
  }
);
```

### [Advanced event matching with `if`](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event\#advanced-event-matching-with-if)

For more complex functions, you may want to match the event payload against some other value. This could be a hard coded value like a billing plan name, a greater than filter for a number value or a value returned from a previous step.

In this example, we have built an AI blog post generator which returns three ideas to the user to select. Then when the user selects an idea from that batch of ideas, we generate an entire blog post and save it.

CopyCopied

```ts
export default inngest.createFunction(
  { id: "generate-blog-post-with-ai" },
  { event: "ai/post.generator.requested" },
  async ({ event, step }) => {
    // Generate a number of suggestions for topics with OpenAI
    const generatedTopics = await step.run("generate-topic-ideas", async () => {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: helpers.topicIdeaPromptWrapper(event.data.prompt),
        n: 3,
      });
      return {
        completionId: completion.data.id,
        topics: completion.data.choices,
      };
    });

    // Send the topics to the user via Websockets so they can select one
    // Also send the completion id so we can match that later
    await step.run("send-user-topics", () => {
      pusher.sendToUser(event.data.userId, "topics_generated", {
        sessionId: event.data.sessionId,
        completionId: generatedTopics.completionId,
        topics: generatedTopics.topics,
      });
    });

    // Wait up to 5 minutes for the user to select a topic
    // Ensuring the topic is from this batch of suggestions generated
    const topicSelected = await step.waitForEvent("wait-for-topic-selection", {
      event: "ai/post.topic.selected",
      timeout: "5m",
      // "async" is the "ai/post.topic.selected" event here:
      if: `async.data.completionId == "${generatedTopics.completionId}"`,
    });

    // If the user selected a topic within 5 minutes, "topicSelected" will
    // be the event payload, otherwise it is null
    if (topicSelected) {
      // Now that we've confirmed the user selected their topic idea from
      // this batch of suggestions, let's generate a blog post
      await step.run("generate-blog-post-draft", async () => {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: helpers.blogPostPromptWrapper(topicSelected.data.prompt),
        });
        // Do something with the blog post draft like save it or something else...
        await blog.saveDraft(completion.data.choices[0]);
      });
    }
  }
);
```

**Preventing race conditions**

The "wait for event" method begins listening for new events from when the code is executed. This means that events sent before the function is executed will not be handled by the wait.

To avoid race condition, always double-check the flow of events going through your functions.

_Note: The "wait for event" mechanism will soon provide a "lookback" feature, including events from a given past timeframe._

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/features/inngest-functions/steps-workflows/wait-for-event.mdx)

[Previous](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps) [Sleeps](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps)

[Next](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration) [AI Inference](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/step-ai-orchestration)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)