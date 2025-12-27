# Track Specification: Database Connection Resilience & HMR Hardening

## Overview
This track addresses recurring `Connection terminated due to connection timeout` errors in the development environment and hardens the database connection layer for production. The root causes are identified as:
1. **Connection Leaks:** Development HMR (Hot Module Replacement) creates multiple `pg.Pool` instances that aren't closed, exhausting Neon's connection limits.
2. **Pool Exhaustion:** The Chat API performs multiple sequential DB operations, compounded by high-frequency Inngest polling, leading to connection contention.

## Goals
- Eliminate database connection leaks during development.
- Standardize and optimize connection pooling across the monorepo.
- Improve the Chat API's performance and resilience to transient DB failures.

## Functional Requirements

### 1. Robust Database Singleton (Monorepo Standard)
- Implement a `getDatabaseResources()` factory in `packages/db/src/index.ts`.
- **Global Cache:** Ensure the `pg.Pool`, `PrismaPg` adapter, and `PrismaClient` are all cached on `globalThis` during development.
- **Explicit Lifecycle:** Add logic to detect an existing pool and either reuse it or explicitly terminate it if configuration changes.

### 2. Chat API Performance Optimization
- **Parallel Reads:** Fetch Session data and Thread validation in parallel using `Promise.all`.
- **Transactional Writes:** Wrap the "Persist User Message" and initial "Tool Call" updates in a Prisma `$transaction` to minimize connection hold time.
- **Graceful Error Handling:** Implement a specific catch block for database connection errors (PG code `57P01`, `08006`, etc.) to return a `503 Service Unavailable` with a `Retry-After` header.

### 3. Monitoring & Telemetry
- **Pool Events:** Add event listeners to the `pg.Pool` (`error`, `connect`, `acquire`) to log connection lifecycle events in development.
- **Slow Query Tracking:** Configure Prisma to log queries exceeding 200ms in development/staging.

## Non-Functional Requirements
- **Performance:** Acquisition of a database connection from the pool should happen in < 50ms under normal load.
- **Stability:** The development server should be able to run for > 4 hours with frequent HMR without reaching Neon connection limits.

## Acceptance Criteria
- [ ] Running `npm run dev` and saving files 20+ times does not increase the active connection count in the Neon dashboard.
- [ ] The Chat API successfully handles concurrent requests alongside Inngest polling without timing out.
- [ ] Database connection errors in `/api/chat` result in a 503 response instead of a generic 500.

## Out of Scope
- Migrating the database provider (remaining on Neon).
- Implementing a Redis-based cache for the Chat API (this is a database layer hardening task).
