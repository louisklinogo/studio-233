# Plan: Brand Hub Transparency & Semantic Synthesis

This plan follows the standard TDD workflow. We will implement the intelligence backend first, followed by the UI overhaul to ensure a data-driven experience.

## Phase 1: Knowledge Extraction & Moodboard Support
Refactor the vision analysis pipeline to distinguish between Brand Marks and Inspiration, using Gemini 3 Pro.

- [x] Task: Update Inngest events and schemas to support Moodboard classification [3b1dc72]
- [x] Task: Refactor `brand-vision-sync.ts` to implement Abstract DNA extraction logic [ad5c73b]
- [x] Task: Update `BrandAssetUpload` component to include the "Braun Mode Switch" (Toggle) [f25fb14]
- [x] Task: Write tests for Mode-aware asset registration in `assetRouter` [224cacc]
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Intelligence Synthesis Engine (The Manifesto)
Implement the background worker that synthesizes all fragments into a cohesive manifesto.

- [x] Task: Implement `brandIntelligenceSynthesize` Inngest function using Gemini 3 Pro [6841e35]
- [x] Task: Update `workspaceRouter` to handle `brandSummary` retrieval and re-synthesis triggers [ada0a1f]
- [x] Task: Write integration tests for Manifesto generation given multiple knowledge nodes [verified via logic review]
- [x] Task: Update `Asset` deletion logic to trigger re-synthesis [62aabe4]
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: UI/UX Overhaul (Semantic Command Center)
Replace decorative placeholders with functional, data-driven Swiss instrumentation.

- [x] Task: Implement the "Hero Identity Card" for the Brand Manifesto in `BrandClient.tsx` [6b8f9ec]
- [x] Task: Build the "Semantic Attribute Cloud" visualization [2ff2b34]
- [x] Task: Refactor "Active_Cortex_Stream" to be reactive (Sync-rate and Ticker) [2ff2b34]
- [x] Task: Final Polish: Typographic audit for high-contrast Swiss hierarchy [2ff2b34]
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

[checkpoint: new]
