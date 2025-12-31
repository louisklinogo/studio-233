# Implementation Plan - Track: brand_ambient_context_20251231

## Phase 1: Identity Foundation (Internal Package)
- [x] Task: Scaffold `packages/brand` infrastructure
    - [x] Create `packages/brand/package.json` and `tsconfig.json`
    - [x] Define `BrandContext` interface in `src/types.ts`
- [x] Task: Implement Identity Resolver (Tier 1)
    - [x] **Red Phase:** Create `packages/brand/src/resolver.test.ts` to validate color/font fetching
    - [x] **Green Phase:** Implement `resolveIdentity` logic with Prisma fetching
    - [x] Add TTL caching layer using Vercel KV for core signals
- [x] Task: Conductor - User Manual Verification 'Identity Foundation' (Protocol in workflow.md)

## Phase 2: Semantic Integration (RAG Bridge)
- [x] Task: Implement Semantic Resolver (Tier 2)
    - [x] **Red Phase:** Add tests for RAG snippet retrieval within the resolver
    - [x] **Green Phase:** Integrate `@studio233/rag` retrieval service
    - [x] Implement snippet culling (Top 3 fragments) to manage token budget
- [x] Task: Implement Visual DNA Resolver (Tier 3)
    - [x] **Red Phase:** Validate extraction of `visual_dna` nodes from brand knowledge
    - [x] **Green Phase:** Map vision analysis metadata to the context payload
- [x] Task: Conductor - User Manual Verification 'Semantic Integration' (Protocol in workflow.md)

## Phase 3: Runtime Orchestration
- [x] Task: Implement Prompt Injection Engine
    - [x] **Red Phase:** Test prompt construction in `packages/ai/src/runtime/prompt.test.ts`
    - [x] **Green Phase:** Implement `<IDENTITY_PROTOCOL>` technical envelope generator
    - [x] Update `packages/ai` to accept and inject the resolved context
- [x] Task: Link Chat Middleware
    - [x] **Red Phase:** Create integration test for `/api/chat` parallel resolution
    - [x] **Green Phase:** Update `/api/chat/route.ts` to use `Promise.all` for context resolution
- [x] Task: Conductor - User Manual Verification 'Runtime Orchestration' (Protocol in workflow.md)

## Phase 4: Validation & Hardening
- [x] Task: End-to-End System Verification
    - [x] Verify agent uses brand colors in tool calls without explicit prompting
    - [x] Verify RAG snippets are correctly injected for semantic queries
    - [x] Profile resolution latency to ensure <50ms overhead
- [x] Task: Conductor - User Manual Verification 'Validation & Hardening' (Protocol in workflow.md)
