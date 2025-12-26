# Implementation Plan: Database Connection Resilience & HMR Hardening

## Phase 1: Core Database Layer Refactoring
Refactor the database package to handle connection pooling correctly across HMR and provide a robust singleton.

- [x] **Task 1: Resource Management Factory** [d1afbab]
  - Modify `packages/db/src/index.ts` to implement a `PrismaResource` interface (containing `pool`, `adapter`, and `client`).
  - Implement logic to cache the entire resource object on `globalThis`.
  - Add pool event listeners (`connect`, `error`, `acquire`) for better observability.
- [x] **Task 2: Cleanup Utility** [d1afbab]
  - Add a `disconnect()` function to export, ensuring the pool is drained correctly for testing or edge cases.
- [x] **Task 3: Pool Parameter Optimization** [d1afbab]
  - Review and adjust `max`, `idleTimeoutMillis`, and `connectionTimeoutMillis` based on Neon's "Transaction Mode" recommendations.
- [x] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)** [checkpoint: 18bf994]

## Phase 2: Chat API Hardening
Optimize the Chat API route to reduce connection thrashing and handle timeouts gracefully.

- [x] **Task 1: Parallel Read Implementation** [c8f977a]
  - In `apps/web/src/app/api/chat/route.ts`, refactor `getSessionWithRetry` and `db.agentThread.findUnique` to execute via `Promise.all`.
- [x] **Task 2: Transactional Write Implementation** [c8f977a]
  - Wrap initial thread creation and message persistence in a `$transaction`.
  - Ensure subsequent `onToolCall` and `onFinish` updates use optimized write patterns.
- [x] **Task 3: Resilient Error Handling** [c8f977a]
  - Implement a specialized error handler for database connection/timeout errors.
  - Map specific Prisma/PG error codes to a `503 Service Unavailable` response.
- [x] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)** [checkpoint: a7d0de1]

## Phase 3: Verification & Observability
Ensure the fixes are effective and provide ongoing visibility into connection health.

- [x] **Task 1: HMR Leak Verification** [a7d0de1]
  - Perform stress test (20+ file saves) while monitoring Neon connection logs.
- [x] **Task 2: Integration Testing** [88c5814]
  - Add/Update a test script to simulate concurrent Chat API and Inngest requests to verify no connection deadlocks.
- [x] **Task 3: Logging Standardization** [88c5814]
  - Ensure slow query logging is consistent and informative in development.
- [x] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)** [checkpoint: 628aa60]
