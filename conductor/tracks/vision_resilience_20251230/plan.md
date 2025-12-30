# Implementation Plan: Vision Resilience & Hardening

## Phase 1: Core Infrastructure [checkpoint: e524075]
- [x] Task: Create `packages/ai/src/utils/http.ts` with `robustFetch` (Retries, Backoff, Bun-optimized). [0b86f07]
- [x] Task: Update `packages/ai/src/utils/blob-storage.ts` to support `addRandomSuffix: false`. [fa6607a]
- [x] Task: Create `packages/ai/src/utils/hashing.ts` using `Bun.CryptoHasher` for stream-based SHA-256. [0a7732d]
- [x] Task: Conductor - User Manual Verification 'Phase 1 Core Infrastructure' (Protocol in workflow.md) [e524075]

## Phase 2: Workflow Refactoring
- [ ] Task: Refactor `packages/ai/src/workflows/vision-analysis.ts` to implement the Pre-download + Binary Injection pattern.
- [ ] Task: Integrate Vercel KV and Inngest idempotency for request coalescing.
- [ ] Task: Implement Fast-Fail logic with specific `AssetFetchError` and `BlobStorageError` types.
- [ ] Task: Conductor - User Manual Verification 'Phase 2 Workflow Refactoring' (Protocol in workflow.md)

## Phase 3: Cleanup & Verification
- [ ] Task: Add `vision.cleanup.requested` event and Inngest function for `/tmp` pruning.
- [ ] Task: Enhance `vision-resilience.test.ts` to simulate 50% packet loss and thundering herd scenarios.
- [ ] Task: Conductor - User Manual Verification 'Phase 3 Cleanup & Verification' (Protocol in workflow.md)
