# Specification: DB Connection Resilience (Neon Timeout Fix)

## Overview
This track addresses a recurring `Connection terminated due to connection timeout` error occurring in local development. The error is triggered when `better-auth` attempts to find a session using the Prisma adapter, specifically when connecting to a remote Neon database that may be experiencing cold starts.

## Problem Statement
The local development environment connects to a Neon database. Neon's serverless architecture puts databases to sleep after inactivity. The initial wake-up time plus pooler latency often exceeds Prisma's default timeout limits, causing `better-auth` session lookups to fail and crashing the application load.

## Functional Requirements
- Increase database connection and pool timeouts to accommodate serverless cold starts.
- Ensure the Prisma client is initialized with settings optimized for serverless/pooled environments.
- Verify and potentially enhance the `getSessionWithRetry` utility to ensure it effectively handles adapter-level failures.

## Acceptance Criteria
- [ ] No "Connection terminated" errors on first load after a period of inactivity.
- [ ] Database connection strings in `.env.local` include optimized timeout parameters.
- [ ] Prisma client configuration (in `packages/db`) is verified for pooling best practices.
- [ ] `getSessionWithRetry` logic is confirmed to cover the `better-auth` adapter path.

## Out of Scope
- Migrating away from Neon or Prisma.
- Implementing a full-scale circuit breaker pattern (unless deemed necessary).
