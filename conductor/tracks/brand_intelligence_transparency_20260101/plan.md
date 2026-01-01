# Plan: Brand Hub Transparency & Semantic Synthesis

This plan follows the standard TDD workflow. We will implement the intelligence backend first, followed by the UI overhaul to ensure a data-driven experience.

## Phase 1: Knowledge Extraction & Moodboard Support
Refactor the vision analysis pipeline to distinguish between Brand Marks and Inspiration, using Gemini 3 Pro.

- [ ] Task: Update Inngest events and schemas to support Moodboard classification
- [ ] Task: Refactor `brand-vision-sync.ts` to implement Abstract DNA extraction logic
- [ ] Task: Update `BrandAssetUpload` component to include the "Braun Mode Switch" (Toggle)
- [ ] Task: Write tests for Mode-aware asset registration in `assetRouter`
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Intelligence Synthesis Engine (The Manifesto)
Implement the background worker that synthesizes all fragments into a cohesive manifesto.

- [ ] Task: Implement `brandIntelligenceSynthesize` Inngest function using Gemini 3 Pro
- [ ] Task: Update `workspaceRouter` to handle `brandSummary` retrieval and re-synthesis triggers
- [ ] Task: Write integration tests for Manifesto generation given multiple knowledge nodes
- [ ] Task: Update `Asset` deletion logic to trigger re-synthesis
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: UI/UX Overhaul (Semantic Command Center)
Replace decorative placeholders with functional, data-driven Swiss instrumentation.

- [ ] Task: Implement the "Hero Identity Card" for the Brand Manifesto in `BrandClient.tsx`
- [ ] Task: Build the "Semantic Attribute Cloud" visualization
- [ ] Task: Refactor "Active_Cortex_Stream" to be reactive (Sync-rate and Ticker)
- [ ] Task: Final Polish: Typographic audit for high-contrast Swiss hierarchy
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

[checkpoint: new]
