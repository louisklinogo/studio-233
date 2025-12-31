# Track Specification: Vision Tooling Architecture Refactor

## Overview
Current logs indicate persistent Zod validation errors where agents send raw HTML/CSS to the `htmlToCanvas` tool, which strictly expects a creative `brief`. This reveals a lack of architectural distinction between "Generation/Design" and "Rendering/Execution" in the agent's toolset.

This track implements a strict separation of concerns, providing agents with distinct tools for distinct intents, and updating their system prompts to intelligently select between them.

## Architecture of Intent

| Tool | Intent | Input | Output | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **`renderHtml`** | **The Printer** | Raw HTML/CSS Strings | Canvas Image | Rendering specific code snippets, debugging layout code, executing exact code instructions. |
| **`htmlToCanvas`** | **The Designer** | Text Brief ("A poster...") | Canvas Image | Creating layouts, UI mocks, text-heavy designs from scratch. |
| **`canvasTextToImage`** | **The Artist** | Text Prompt ("A photo...") | Canvas Image | Photorealistic images, artistic scenes, style transfers (Pixel/Raster generation). |

## Functional Requirements

### 1. New Tool: `renderHtml`
- **Purpose:** Pure technical execution.
- **Schema:**
  - `html` (Required, string): The raw HTML content.
  - `css` (Required, string): The raw CSS content.
  - `renderWidth` (Optional, number, default: 1080).
  - `renderHeight` (Optional, number, default: 1080).
  - `renderScale` (Optional, number, default: 1).
- **Behavior:**
  - Validates strict presence of `html` and `css`.
  - Wraps existing `htmlRenderWorkflow`.
  - Returns standard `add-image` command to canvas.

### 2. Refactor: `htmlToCanvas`
- **Purpose:** Creative entry point.
- **Schema Update:**
  - **Remove** `html` and `css` as valid inputs.
  - **Enforce** `brief` as the primary required input.
  - Maintain `layout`, `theme`, `format` parameters.
- **Behavior:**
  - Calls `htmlGeneratorWorkflow` to create the code.
  - Passes result to `htmlRenderWorkflow`.

### 3. Agent Intelligence (Prompt Engineering)
- Update **Orchestrator** and **Vision Forge** system prompts.
- **Explicit Instruction:**
  - "IF user provides specific code -> Use `renderHtml`."
  - "IF user describes a layout/design -> Use `htmlToCanvas`."
  - "IF user describes a scene/photo -> Use `canvasTextToImage`."

## Acceptance Criteria
- [ ] `renderHtml` implemented and tested with strict schema validation.
- [ ] `htmlToCanvas` refactored to reject raw code inputs.
- [ ] Agents updated with new tools and explicit decision logic.
- [ ] Integration test confirms:
  - Text description -> `htmlToCanvas` -> Success.
  - Raw HTML -> `renderHtml` -> Success.
