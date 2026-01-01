# Specification: Brand Hub Transparency & Semantic Synthesis

## 1. Overview
The goal of this track is to evolve the Brand Hub from a technical storage dashboard into a "Semantic Command Center." We will replace "Interface Theater" (decorative animations) with data-driven visualizations and implement a synthesis engine that generates a cohesive brand identity from diverse assets.

## 2. Functional Requirements

### 2.1 Abstract DNA Extraction
- **Intelligence Upgrade:** Enhance the vision analysis pipeline to use `gemini-3-pro-preview`.
- **Mode Switching:** The uploader will include a Braun-style explicit toggle (`INDEX_AS_INSPIRATION` vs `CORE_BRAND_MARK`).
- **Semantic Analysis:** Gemini will be prompted to deduce abstract design schools, emotional resonance, and structural principles instead of literal image descriptions.

### 2.2 Intelligence Synthesis Engine
- **The Manifesto:** A new Inngest function will synthesize all indexed fragments into a unified "Brand Manifesto."
- **Data Structure:** The manifesto will include a high-level identity statement, 3-5 verbal tone keywords, and 3-5 visual aesthetic keywords.
- **Trigger:** Re-synthesis is triggered on asset deletion or a manual "Synchronize" request.

### 2.3 Semantic UI Overhaul
- **Hero Identity Card:** A high-contrast card at the top of the Intelligence sector displaying the synthesized Manifesto.
- **Attribute Cloud:** A dynamic visualization of deduced semantic keywords extracted from the RAG store.
- **Functional Cortex Stream:** Replace the static "Active_Cortex_Stream" with a data-responsive visualizer that shows real-time sync rates and a scrolling ticker of "DNA Fragments."

## 3. Non-Functional Requirements
- **Performance:** Synthesis must happen in the background (Inngest) to avoid blocking the main UI.
- **Design Standards:** Adhere strictly to Swiss Design (International Typographic Style) and Braun Industrial design principles ( neutrals + #FF4D00 accents).
- **Consistency:** Use the `@studio233/rag` and `@studio233/db` packages exclusively for intelligence operations.

## 4. Acceptance Criteria
- [ ] Uploading a "Moodboard" asset extracts style principles without describing literal subject matter.
- [ ] The "Intelligence" tab displays a cohesive Manifesto Hero Card.
- [ ] Deleting an asset removes its specific DNA fragments and triggers a re-synthesis of the Manifesto.
- [ ] The "Active_Cortex_Stream" reacts visually to the presence or absence of indexed data.

## 5. Out of Scope
- Manual editing of the AI-generated Manifesto (v1.0 will be AI-authoritative).
- Complex 3D visualizations of the vector space.
