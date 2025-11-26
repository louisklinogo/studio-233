---
name: inngest
description: Build and operate Inngest event-driven workflows (triggers, steps, retries, middleware) using our curated research notes.
---

# Inngest Skill

## Purpose
Provide a turnkey process for designing, coding, and verifying Inngest functions/events that power Studio+233 automation.

## Invoke When
- Creating or modifying Inngest functions, schedulers, or event pipelines.  
- Adding middleware (encryption, Sentry, AI inference) or aligning with Vercel deploy targets.  
- Documenting event schemas, retries, and compensation paths.

## Required Inputs
1. Event contract (name, payload fields, producer).  
2. Desired execution pattern (cron, fan-out, wait-for-event, sleeps).  
3. Runtime target (Next.js API route, Inngest CLI, Vercel).  
4. Observability + failure handling expectations.

## Implementation Steps
1. **Model the Event Flow**  
   - Reference `docs/research/inngest/events-and-triggers.md` + `sending-events.md` to define event names, keys, and dedupe strategy.  
   - Capture schemas and event keys before touching code.
2. **Author Functions**  
   - Use `inngest-functions.md`, `steps-and-workflows.md`, and `ai-inference.md` for function builders, step patterns, sleeps, and AI tool usage.  
   - Document resource requirements per `inngest-functions-resources.md`.
3. **Add Middleware & Hooks**  
   - Apply logging or encryption per `creating-middleware.md`, `encryption-middleware.md`, `sentry-middleware.md`.  
   - If fetching external APIs, follow `performing-api-requests-or-fetch.md` best practices.
4. **Scheduling & Waiting**  
   - For cron/one-off jobs see `scheduling-a-one-off-function.md`; for orchestrations waiting on events, use `wait-for-an-event.md` guidance.  
   - Use `creating-an-event-key.md` to prevent duplicate processing.
5. **Deployment + Apps**  
   - Consult `inngest-apps.md` and `vercel-inngest.md` when wiring into hosting targets.  
   - Note CLI commands and secrets handling.
6. **Failure Handling**  
   - Implement compensations/retries referencing `failure-handlers.md`, `cleanup-after-function-cancellation.md`.  
   - Document manual recovery steps.

## Deliverables
- Event schema definitions + TypeScript types.  
- Inngest function source with commentary referencing doc sections.  
- Runbook snippet explaining triggers, retries, and dashboards.

## Verification Checklist
- ✅ Local `inngest dev` or integration test run demonstrating event lifecycle.  
- ✅ Lint/typecheck results.  
- ✅ Evidence that failure handlers + middleware paths were exercised (logs, screenshots, or CLI output).

## References
- `docs/research/inngest/*.md` (see `references.md` for index).  
- Link to any upstream producer/consumer repos touched.
