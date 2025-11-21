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

## Platform

## Deploymentnew

- [Overview](https://www.inngest.com/docs/platform/deployment)
- [Environments & Apps](https://www.inngest.com/docs/apps)
- [Syncing](https://www.inngest.com/docs/apps/cloud)
- [Event keys](https://www.inngest.com/docs/events/creating-an-event-key)
- [Signing keys](https://www.inngest.com/docs/platform/signing-keys)

## Cloud Providersnew

- Guides
- [Connectnew](https://www.inngest.com/docs/setup/connect)
- [Self hosting](https://www.inngest.com/docs/self-hosting)

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

- [Creating an Event Key](https://www.inngest.com/docs/events/creating-an-event-key#top)
- [Creating a new Event Key](https://www.inngest.com/docs/events/creating-an-event-key#creating-a-new-event-key)

Platform [Deployment](https://www.inngest.com/docs/platform/deployment)

# Creating an Event Key

“Event Keys” are unique keys that allow applications to send (aka publish) events to Inngest. When using Event Keys with the [Inngest SDK](https://www.inngest.com/docs/events), you can configure the `Inngest` client in 2 ways:

1. Setting the key as an [`INNGEST_EVENT_KEY`](https://www.inngest.com/docs/sdk/environment-variables#inngest-event-key) environment variable in your application\*
2. Passing the key as an argument

CopyCopied

```jsx
// Recommended: Set an INNGEST_EVENT_KEY environment variable for automatic configuration:
const inngest = new Inngest({ name: "Your app name" });

// Or you can pass the eventKey explicitly to the constructor:
const inngest = new Inngest({ name: "Your app name", eventKey: "xyz..." });

// With the Event Key, you're now ready to send data:
await inngest.send({ ... })
```

\\* Our [Vercel integration](https://www.inngest.com/docs/deploy/vercel) automatically sets the [`INNGEST_EVENT_KEY`](https://www.inngest.com/docs/sdk/environment-variables#inngest-event-key) as an environment variable for you

🙋 Event Keys should be unique to a given **environment** (e.g. production, branch environments) and a specific **application** (your API, your mobile app, etc.). Keeping keys separated by application makes it easier to manage keys and rotate them when necessary.

🔐 **Securing Event Keys** \- As Event Keys are used to send data to your Inngest environment, you should take precautions to secure your keys. Avoid storing them in source code and store the keys as secrets in your chosen platform when possible.

## [Creating a new Event Key](https://www.inngest.com/docs/events/creating-an-event-key\#creating-a-new-event-key)

From the Inngest Cloud dashboard, Event Keys are listed in the "Manage" tab:

1. Click on "Manage" ( [direct link](https://app.inngest.com/env/production/manage/keys))
2. Click the "+ Create Event Key" button at the top right
3. Update the Event Key's name to something descriptive and click "Save changes"
4. Copy the newly created key using the “Copy” button:

![A newly created Event Key in the Inngest Cloud dashboard](https://www.inngest.com/_next/image?url=%2Fassets%2Fdocs%2Fcreating-an-event-key%2Fnew-event-key-2023.png&w=3840&q=75)

🎉 You can now use this event key with the Inngest SDK to send events directly from any codebase. You can also:

- Rename your event key at any time using the “Name” field so you and your team can identify it later
- Delete the event key when your key is no longer needed
- Filter events by name or IP addresses for increased control and security

⚠️ While it is _possible_ to use Event Keys to send events from the browser, this practice presents risks as anyone inspecting your client side code will be able to read your key and send events to your Inngest environment. If you'd like to send events from the client, we recommend creating an API endpoint or edge function to proxy the sending of events.

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/events/creating-an-event-key.mdx)

[Previous](https://www.inngest.com/docs/apps/cloud) [Syncing](https://www.inngest.com/docs/apps/cloud)

[Next](https://www.inngest.com/docs/platform/signing-keys) [Signing keys](https://www.inngest.com/docs/platform/signing-keys)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)