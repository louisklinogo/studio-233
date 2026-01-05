# Track: Premier Vision-First Ingestion Pipeline

## Overview
Implementation of a state-of-the-art Multimodal Ingestion Pipeline (2025 Standard) for `studio+233`. This pipeline treats visual context as a first-class citizen by employing a dual-path processing model ("Swiss Cheese" model) to ensure 99% brand context coverage. It extracts "Brand DNA" from ingested assets to power Ambient Brand Intelligence.

## Functional Requirements

### 1. Dual-Path Processing Logic
- **Path A (The Specialist):** Primary ingestion using **LlamaParse Multimodal API**.
    - Configuration: `mode="multimodal"`, using `MODEL_CONFIG.vision.model` (Gemini 3 Flash Preview) where applicable for underlying parsing.
    - Returns: Markdown structure + Extracted Images + Metadata.
- **Path B (The Artist):** Fallback ingestion using **Gemini Vision** via `pdf-to-img` rasterization.
    - Trigger: Used if LlamaParse fails or returns a low fidelity score.
    - Process: PDF Page → Rasterization → Vision analysis using `MODEL_CONFIG.vision`.
    - Prompt: Structured JSON prompt to extract specific Brand DNA.

### 2. BrandDNA Extraction Schema
The pipeline must extract and standardize the following fields into a unified JSON schema:
- **Core Identity:** Colors (hex codes), Fonts (families/usage), Logos, Slogans.
- **Visual Style:** Layout principles, Imagery style, Photography guidelines, "Vibe" description.
- **Semantic DNA:** Tone of Voice, Copywriting guidelines.

### 3. Data Integrity & Validation
- **Quality Score:** Implement a scoring mechanism to determine the fidelity of extraction.
- **Strict Validation:** If the combined result yields < 50 characters of meaningful description or fails schema validation, the ingestion task must be rejected.
- **Standardized Output:** Both processing paths must output data adhering to the same `BrandDNA` schema.

## Technical Requirements
- **Service Location:** `packages/rag/src/multimodal-service.ts`.
- **Primary Export:** `async function multimodalIngestionService(...)`.
- **Dependencies:** 
    - `llamaindex` (existing).
    - `pdf-to-img` (for rasterization fallback).
    - `@studio233/ai` (for `MODEL_CONFIG`).
- **Environment:** Requires `Poppler` (poppler-utils) in the production environment for `pdf-to-img`.

## Acceptance Criteria
- [ ] Successfully ingests a multi-page brand PDF.
- [ ] Falls back to Gemini Vision (`MODEL_CONFIG.vision`) if LlamaParse fails.
- [ ] Outputs a valid JSON object matching the `BrandDNA` schema.
- [ ] Rejects low-quality/empty extractions (<50 chars).
- [ ] Integrated with existing Inngest `brand-ingestion` function.

## Out of Scope
- Real-time video ingestion.
- Direct integration with social media APIs (extraction only from uploaded assets).
