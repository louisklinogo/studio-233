# Plan: Premier Vision-First Ingestion Pipeline

## Phase 1: Foundation & Schema Design
- [x] Task: Create `packages/rag/src/schemas/brand-dna.ts` and define the `BrandDNA` Zod schema including Core Identity, Visual Style, and Semantic DNA fields. [0a96421]
- [x] Task: Create `packages/rag/src/multimodal-service.ts` with a basic shell for the service. [eb32475]
- [x] Task: Implement `BrandDNA` schema validation tests to ensure strict validation rules (e.g., rejecting empty objects). [a308bc7]

## Phase 2: Path A - LlamaParse Integration
- [ ] Task: Implement `processWithLlamaParse` function in `multimodal-service.ts` using `llamaindex`.
- [ ] Task: Configure LlamaParse mode to `multimodal` and handle markdown/image response parsing.
- [ ] Task: Write integration test for LlamaParse path (mocking the API response).

## Phase 3: Path B - Visual Fallback (Gemini Vision)
- [ ] Task: Verify `pdf-to-img` configuration in `packages/rag`.
- [ ] Task: Implement `pdfToImages` utility for rasterization.
- [ ] Task: Implement `processWithGeminiVision` function using `MODEL_CONFIG.vision` and the Structured JSON Prompt.
- [ ] Task: Write integration test for Gemini Vision path (mocking the API response).

## Phase 4: Integration & Synthesis
- [ ] Task: Implement the "Swiss Cheese" logic in `multimodalIngestionService` (Try Path A -> Catch/Score Check -> Path B).
- [ ] Task: Implement result aggregation and quality scoring logic.
- [ ] Task: Integrate `multimodalIngestionService` into `packages/inngest/src/functions/brand-ingestion.ts`.
- [ ] Task: Conductor - User Manual Verification 'Integration & Synthesis' (Protocol in workflow.md)
