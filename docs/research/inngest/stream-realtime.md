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

- [Realtime: Stream updates from Inngest functions](https://www.inngest.com/docs/examples/realtime#top)
- [Pattern: Stream updates from a single function run](https://www.inngest.com/docs/examples/realtime#pattern-stream-updates-from-a-single-function-run)
- [Pattern: Stream updates from multiple function runs](https://www.inngest.com/docs/examples/realtime#pattern-stream-updates-from-multiple-function-runs)
- [Human in the loop: Bi-directional workflows](https://www.inngest.com/docs/examples/realtime#human-in-the-loop-bi-directional-workflows)
- [Learn more](https://www.inngest.com/docs/examples/realtime#learn-more)

[Examples](https://www.inngest.com/docs/examples)

# Realtime: Stream updates from Inngest functions

Inngest Realtime enables you to stream updates from your functions, power live UIs, and implement bi-directional workflows such as Human-in-the-Loop. Use channels and topics to broadcast updates, stream logs, or await user input.

## [Pattern: Stream updates from a single function run](https://www.inngest.com/docs/examples/realtime\#pattern-stream-updates-from-a-single-function-run)

Enable users to follow the progress of a long-running task by streaming updates from a dedicated channel. Here's how to trigger a function and subscribe to its updates:

CopyCopied

```ts
import crypto from "crypto";
import { inngest } from "@/inngest/client";
import { subscribe } from "@inngest/realtime";

export async function POST(req: Request) {
  const json = await req.json();
  const { prompt } = json;
  const uuid = crypto.randomUUID();

  await inngest.send({
    name: "hello-world/hello",
    data: { uuid },
  });

  const stream = await subscribe(inngest, {
    channel: `hello-world.${uuid}`,
    topics: ["logs"],
  });

  return new Response(stream.getEncodedStream(), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

Your function can then publish updates to this channel:

CopyCopied

```ts
import { Inngest } from "inngest";
import { realtimeMiddleware, channel, topic } from "@inngest/realtime";

const inngest = new Inngest({
  id: "my-app",
  middleware: [realtimeMiddleware()],
});

export const helloChannel = channel((uuid: string) => `hello-world.${uuid}`).addTopic(
  topic("logs").type<string>()
);

export const someTask = inngest.createFunction(
  { id: "hello-world" },
  { event: "hello-world/hello" },
  async ({ event, step, publish }) => {
    const { uuid } = event.data;
    await publish(helloChannel(uuid).logs("Hello, world!"));
  }
);
```

By creating a channel with a unique identifier, you can stream updates for a specific run to the end user.

[**Explore the full source code**\\
\\
Clone this example locally to run it and explore the full source code.](https://github.com/inngest/inngest-js/tree/main/examples/realtime/nodejs/realtime-single-run-subscription)

## [Pattern: Stream updates from multiple function runs](https://www.inngest.com/docs/examples/realtime\#pattern-stream-updates-from-multiple-function-runs)

A Realtime channel can be used to stream updates from multiple function runs. Here, we'll define two channels: one global channel and one post-specific channel:

### `src/inngest/channels.ts`

CopyCopied

```ts
import {
  channel,
  topic,
} from "@inngest/realtime";
import { z } from "zod";

export const globalChannel = channel("global").addTopic(topic("logs").type<string>());

export const postChannel = channel((postId: string) => `post:${postId}`)
  .addTopic(
    topic("updated").schema(
      z.object({
        id: z.string(),
        likes: z.number(),
      })
    )
  )
  .addTopic(
    topic("deleted").schema(
      z.object({
        id: z.string(),
        reason: z.string(),
      })
    )
  );
```

Our `likePost` function will publish updates to both channels:

### `src/inngest/functions/likePost.ts`

CopyCopied

```ts
import {
  channel,
  realtimeMiddleware,
  subscribe,
  topic,
} from "@inngest/realtime";
import { EventSchemas, Inngest } from "inngest";
import { globalChannel, postChannel } from "../channels";

export const likePost = app.createFunction(
  {
    id: "post/like",
    retries: 0,
  },
  {
    event: "app/post.like",
  },
  async ({
    event: {
      data: { postId = "123" },
    },
    step,
    publish,
  }) => {
    if (!postId) {
      await publish(
        globalChannel().logs("Missing postId when trying to like post")
      );
      throw new Error("Missing postId");
    }

    await publish(globalChannel().logs(`Liking post ${postId}`));

    // Fake a post update
    const post = await step.run("Update likes", async () => {
      const fakePost = {
        id: "123",
        likes: Math.floor(Math.random() * 10000),
      };

      return publish(postChannel(fakePost.id).updated(fakePost));
    });

    return post;
  }
);
```

The `globalChannel` will be used to stream updates for all posts, and the `postChannel` will be used to stream updates for specific posts.

[**Explore the full source code**\\
\\
Clone this example locally to run it and explore the full source code.](https://github.com/inngest/inngest-js/tree/main/examples/realtime/nodejs/realtime-across-multiple-channels)

## [Human in the loop: Bi-directional workflows](https://www.inngest.com/docs/examples/realtime\#human-in-the-loop-bi-directional-workflows)

Combine Realtime with `waitForEvent()` to enable workflows that require user input, such as review or approval steps. Here's how to send a message to the user and wait for their confirmation:

CopyCopied

```ts
import crypto from "crypto";
import { Inngest } from "inngest";
import { realtimeMiddleware, channel, topic } from "@inngest/realtime";

const inngest = new Inngest({
  id: "my-app",
  middleware: [realtimeMiddleware()],
});

export const agenticWorkflowChannel = channel("agentic-workflow").addTopic(
  topic("messages").schema(
    z.object({
      message: z.string(),
      confirmationUUid: z.string(),
    })
  )
);

export const agenticWorkflow = inngest.createFunction(
  { id: "agentic-workflow" },
  { event: "agentic-workflow/start" },
  async ({ event, step, publish }) => {
    await step.run(/* ... */);
    const confirmationUUid = await step.run("get-confirmation-uuid", async () => crypto.randomUUID());
    await publish(agenticWorkflowChannel().messages({
      message: "Confirm to proceed?",
      confirmationUUid,
    }));
    const confirmation = await step.waitForEvent("wait-for-confirmation", {
      event: "agentic-workflow/confirmation",
      timeout: "15m",
      if: `async.data.confirmationUUid == \"${confirmationUUid}\"`,
    });
    if (confirmation) {
      // continue workflow
    }
  }
);
```

The `confirmationUUid` links the published message to the reply event, ensuring the correct user response is handled.

[**Explore the full source code**\\
\\
Clone this example locally to run it and explore the full source code.](https://github.com/inngest/inngest-js/tree/main/examples/realtime/nodejs/realtime-human-in-the-loop)

## [Learn more](https://www.inngest.com/docs/examples/realtime\#learn-more)

[**Realtime documentation** \\
\\
Learn more about streaming updates and real-time workflows with Inngest.](https://www.inngest.com/docs/features/realtime)

[**Using Realtime with Next.js** \\
\\
Learn how to use Realtime with Next.js.](https://www.inngest.com/docs/features/realtime/react-hooks)

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/examples/realtime.mdx)

[Previous](https://www.inngest.com/docs/examples/fetch) [Fetch: Durable HTTP requests](https://www.inngest.com/docs/examples/fetch)

[Next](https://www.inngest.com/docs/examples/middleware/cloudflare-workers-environment-variables) [Cloudflare Workers & Hono environment variables](https://www.inngest.com/docs/examples/middleware/cloudflare-workers-environment-variables)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)