# Plan: DB Connection Resilience (Neon Timeout Fix)

## Phase 1: Configuration Hardening
- [x] Task: Update `.env.example` with recommended Neon timeout parameters (`connect_timeout=30&pool_timeout=30`). 8c955f0
- [~] Task: Apply optimized timeout parameters to `.env.local` database connection strings.
- [ ] Task: Audit `packages/db/src/index.ts` to ensure Prisma client is configured with appropriate pooling for serverless environments.
- [ ] Task: Conductor - User Manual Verification 'Configuration Hardening' (Protocol in workflow.md)

## Phase 2: Resilience Layer Enhancement (TDD)
- [ ] Task: Conductor - Write failing test for `getSessionWithRetry` in `packages/auth` that simulates a "Connection terminated" error.
- [ ] Task: Update `isTransientNetworkError` in `packages/auth/src/lib/session.ts` to include Prisma/Neon connection timeout strings.
- [ ] Task: Verify tests pass with the enhanced error detection and retry logic.
- [ ] Task: Conductor - User Manual Verification 'Resilience Layer Enhancement' (Protocol in workflow.md)

## Phase 3: Final Verification
- [ ] Task: Run all `better-auth` related tests to ensure no regressions in session management.
- [ ] Task: Perform manual cold-start verification by letting the local DB idle and then refreshing the login page.
- [ ] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)
