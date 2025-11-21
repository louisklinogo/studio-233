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

- [Vercel](https://www.inngest.com/docs/deploy/vercel)
- [DigitalOceannew](https://www.inngest.com/docs/deploy/digital-ocean)
- [Cloudflare Pages](https://www.inngest.com/docs/deploy/cloudflare)
- [Netlify](https://www.inngest.com/docs/deploy/netlify)
- [Render](https://www.inngest.com/docs/deploy/render)
- [Cloud Provider Usage Limits](https://www.inngest.com/docs/usage-limits/providers)

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

- [Vercel](https://www.inngest.com/docs/deploy/vercel#top)
- [Hosting Inngest functions on Vercel](https://www.inngest.com/docs/deploy/vercel#hosting-inngest-functions-on-vercel)
- [Choose the Next.js App Router or Pages Router:](https://www.inngest.com/docs/deploy/vercel#choose-the-next-js-app-router-or-pages-router)
- [Deploying to Vercel](https://www.inngest.com/docs/deploy/vercel#deploying-to-vercel)
- [Bypassing Deployment Protection](https://www.inngest.com/docs/deploy/vercel#bypassing-deployment-protection)
- [Configure protection bypass](https://www.inngest.com/docs/deploy/vercel#configure-protection-bypass)
- [Multiple apps in one single Vercel project](https://www.inngest.com/docs/deploy/vercel#multiple-apps-in-one-single-vercel-project)
- [Manually syncing apps](https://www.inngest.com/docs/deploy/vercel#manually-syncing-apps)

Platform [Deployment](https://www.inngest.com/docs/platform/deployment) [Cloud Providers](https://www.inngest.com/docs/deploy/vercel)

# Vercel

Inngest enables you to host your functions on Vercel using their [serverless functions platform](https://vercel.com/docs/concepts/functions/serverless-functions). This allows you to deploy your Inngest functions right alongside your existing website and API functions running on Vercel.

Inngest will call your functions securely via HTTP request on-demand, whether triggered by an event or on a schedule in the case of cron jobs.

## [Hosting Inngest functions on Vercel](https://www.inngest.com/docs/deploy/vercel\#hosting-inngest-functions-on-vercel)

After you've written your functions using [Next.js](https://www.inngest.com/docs/learn/serving-inngest-functions?ref=docs-deploy-vercel#framework-next-js) or Vercel's [Express-like](https://www.inngest.com/docs/learn/serving-inngest-functions?ref=docs-deploy-vercel#framework-express) functions within your project, you need to serve them via the `serve` handler. Using the `serve` handler, create a Vercel/Next.js function at the `/api/inngest` endpoint. Here's an example in a Next.js app:

## [Choose the Next.js App Router or Pages Router:](https://www.inngest.com/docs/deploy/vercel\#choose-the-next-js-app-router-or-pages-router)

Next.js - App RouterNext.js - Pages Router

CopyCopied

```ts
import { serve } from "inngest/next";
import { client } from "../../inngest/client";
import { firstFunction, anotherFunction } from "../../inngest/functions";

export const { GET, POST, PUT } = serve({
  client: client,
  functions: [\
    firstFunction,\
    anotherFunction\
  ]
});
```

## [Deploying to Vercel](https://www.inngest.com/docs/deploy/vercel\#deploying-to-vercel)

Installing [Inngest's official Vercel integration](https://vercel.com/integrations/inngest) does 3 things:

1. Automatically sets the required [`INNGEST_SIGNING_KEY`](https://www.inngest.com/docs/sdk/environment-variables#inngest-signing-key) environment variable to securely communicate with Inngest's API ( [docs](https://www.inngest.com/docs/platform/signing-keys)).
2. Automatically sets the [`INNGEST_EVENT_KEY`](https://www.inngest.com/docs/sdk/environment-variables#inngest-event-key) environment variable to enable your application to send events ( [docs](https://www.inngest.com/docs/events/creating-an-event-key)).
3. Automatically syncs your app to Inngest every time you deploy updated code to Vercel - no need to change your existing workflow!

[Install the Inngest Vercel integration](https://app.inngest.com/settings/integrations/vercel/connect)

To enable communication between Inngest and your code, you need to either [disable Deployment Protection](https://vercel.com/docs/security/deployment-protection#configuring-deployment-protection)
or, if you're on Vercel's Pro plan, configure protection bypass:

## [Bypassing Deployment Protection](https://www.inngest.com/docs/deploy/vercel\#bypassing-deployment-protection)

If you have Vercel's [Deployment Protection feature](https://vercel.com/docs/security/deployment-protection) enabled, _by default_, Inngest may not be able to communicate with your application. This may depend on what configuration you have set:

- **"Standard protection"** or **"All deployments"** \- This affects Inngest production and [branch environments](https://www.inngest.com/docs/platform/environments).
- **"Only preview deployments"** \- This affects [branch environments](https://www.inngest.com/docs/platform/environments).

To work around this, you can either:

1. Disable deployment protection
2. Configure protection bypass ( _Protection bypass may or may not be available depending on your pricing plan_)

### [Configure protection bypass](https://www.inngest.com/docs/deploy/vercel\#configure-protection-bypass)

To enable this, you will need to leverage Vercel's " [Protection Bypass for Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)" feature. Here's how to set it up:

1. Enable "Protection Bypass for Automation" on your Vercel project
2. Copy your secret
3. Go to [the Vercel integration settings page in the Inngest dashboard](https://app.inngest.com/settings/integrations/vercel)
4. For each project that you would like to enable this for, add the secret in the "Deployment protection key" input. Inngest will now use this parameter to communicate with your application to bypass the deployment protection.

![A Vercel protection bypass secret added in the Inngest dashboard](https://www.inngest.com/assets/docs/deploy/deployment-protection-key.png)

5. Trigger a re-deploy of your preview environment(s) (this resyncs your app to Inngest)

## [Multiple apps in one single Vercel project](https://www.inngest.com/docs/deploy/vercel\#multiple-apps-in-one-single-vercel-project)

You can pass multiple paths by adding their path information to each Vercel project in the Vercel Integration’s settings page.

![Add new path information button in the Inngest dashboard](https://www.inngest.com/assets/docs/deploy/add-path-info.png)

You can also add paths to separate functions within the same app for bundle size issues or for running certain functions on the edge runtime for streaming.

## [Manually syncing apps](https://www.inngest.com/docs/deploy/vercel\#manually-syncing-apps)

While we strongly recommend our Vercel integration, you can still use Inngest by manually telling Inngest that you've deployed updated functions. You can sync your app [via the Inngest UI](https://www.inngest.com/docs/apps/cloud#sync-a-new-app-in-inngest-cloud) or [via our API with a curl request](https://www.inngest.com/docs/apps/cloud#curl-command).

Was this page helpful?

Yes

No

[Edit this page on GitHub](https://github.com/inngest/website/tree/main/pages/docs/deploy/vercel.mdx)

[Previous](https://www.inngest.com/docs/platform/signing-keys) [Signing keys](https://www.inngest.com/docs/platform/signing-keys)

[Next](https://www.inngest.com/docs/deploy/digital-ocean) [DigitalOcean](https://www.inngest.com/docs/deploy/digital-ocean)

© 2025 Inngest Inc. All rights reserved.

[We're hiring!](https://www.inngest.com/careers)

[Star our open source repository](https://github.com/inngest/inngest) [Join our Discord community](https://www.inngest.com/discord?ref=social-badge) [Follow us on X](https://twitter.com/inngest) [Follow us on Bluesky](https://bsky.app/profile/inngest.com)