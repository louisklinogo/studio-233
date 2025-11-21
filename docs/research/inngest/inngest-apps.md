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

- [Inngest Apps](https://www.inngest.com/docs/apps#top)
- [Apps in SDK](https://www.inngest.com/docs/apps#apps-in-sdk)
- [Apps in Inngest Cloud](https://www.inngest.com/docs/apps#apps-in-inngest-cloud)
- [Apps in Inngest Dev Server](https://www.inngest.com/docs/apps#apps-in-inngest-dev-server)
- [Informing Inngest about your apps](https://www.inngest.com/docs/apps#informing-inngest-about-your-apps)
- [Next Steps](https://www.inngest.com/docs/apps#next-steps)

Platform [Deployment](https://www.inngest.com/docs/platform/deployment)

# Inngest Apps

In Inngest, apps map directly to your projects or services. When you serve your functions using our serve API handler, you are hosting a new Inngest app. With Inngest apps, your dashboard reflects your code organization better.

It's important to note that apps are synced to one environment. You can sync any number of apps to one single environment using different Inngest Clients.

The diagram below shows how each environment can have multiple apps which can have multiple functions each:

![Diagram showing multiple environments, each with various apps. Within these apps, there are numerous functions](https://www.inngest.com/assets/docs/apps/apps-diagram-light.png)![Diagram showing multiple environments, each with various apps. Within these apps, there are numerous functions](https://www.inngest.com/assets/docs/apps/apps-diagram-dark.png)

## [Apps in SDK](https://www.inngest.com/docs/apps\#apps-in-sdk)

Each [`serve()` API handler](https://www.inngest.com/docs/learn/serving-inngest-functions) will generate an app in Inngest upon syncing.
The app ID is determined by the ID passed to the serve handler from the Inngest client.

For example, the code below will create an Inngest app called “example-app” which contains one function:

Node.jsPython (Flask)Python (FastAPI)Go (HTTP)

CopyCopied

```ts
import { Inngest } from "inngest";
import { serve } from "inngest/next"; // or your preferred framework
import { sendSignupEmail } from "./functions";

const inngest = new Inngest({ id: "example-app" });

serve({
  client: inngest,
  functions: [sendSignupEmail],
});
```

Each app ID is considered a persistent identifier. Changing your client ID will result in Inngest not recognizing the app ID during the next sync. As a result, Inngest will create a new app.

## [Apps in Inngest Cloud](https://www.inngest.com/docs/apps\#apps-in-inngest-cloud)

In the image below, you can see the apps page in Inngest Cloud. Check the [Working with Apps Guide](https://www.inngest.com/docs/apps/cloud) for more information about how to sync apps in Inngest Cloud.

![Inngest Cloud screen with apps](https://www.inngest.com/assets/docs/apps/apps-cloud.png)

## [Apps in Inngest Dev Server](https://www.inngest.com/docs/apps\#apps-in-inngest-dev-server)

In the image below, you can see the apps page in Inngest Dev Server. For more information on how to sync apps in Inngest Dev Server check the [Local Development Guide](https://www.inngest.com/docs/local-development#connecting-apps-to-the-dev-server).

![Inngest Dev Server screen with no events recorded](https://www.inngest.com/assets/docs/apps/apps-dev-server.png)

## [Informing Inngest about your apps](https://www.inngest.com/docs/apps\#informing-inngest-about-your-apps)

To integrate your code hosted on another platform with Inngest, you need to inform Inngest about the location of your app and functions.

For example, imagine that your `serve()` handler is located at `/api/inngest`, and your domain is `myapp.com`. In this scenario, you will need to sync your app to inform Inngest that your apps and functions are hosted at `https://myapp.com/api/inngest`.

To ensure that your functions are up to date, you need to resync your app with Inngest whenever you deploy new function configurations to your hosted platform.

Inngest uses the [`INNGEST_SIGNING_KEY`](https://www.inngest.com/docs/platform/signing-keys?ref=deploy) to securely communicate with your application and identify the correct environment to sync your app.

## [Next Steps](https://www.inngest.com/docs/apps\#next-steps)

To continue your exploration, feel free to check out:

- How to [work with Apps in the Dev Server](https://www.inngest.com/docs/local-development#connecting-apps-to-the-dev-server)
- How to [work with Apps in Inngest Cloud](https://www.inngest.com/docs/apps/cloud)

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/apps/index.mdx)

[Previous](https://www.inngest.com/docs/platform/deployment) [Overview](https://www.inngest.com/docs/platform/deployment)

[Next](https://www.inngest.com/docs/apps/cloud) [Syncing](https://www.inngest.com/docs/apps/cloud)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)