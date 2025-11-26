---
name: ai-elements
description: Implement AI Elements UI components (messages, tools, plans, artifacts) alongside the AI SDK to ship polished operator surfaces quickly.
---

# AI Elements Integration

## Purpose
Use the `docs/research/ai-elements/` component guides to drop in production-ready AI UX primitives (Message, Tool, Plan, Artifact, etc.) that stay consistent with our Braun aesthetic and AI SDK event model.

## When to Invoke
- Building or updating UI around AI interactions (chat, copilots, evaluation consoles).
- Need consistent rendering of AI SDK `UIMessage`/`ToolUIPart` parts without reinventing layout/animation.
- Ensuring accessibility + keyboard support for tool disclosures and reasoning timelines.

## Inputs Required
1. Target screen + route (e.g., `/dashboard`, `/studio`).
2. Data source (AI SDK stream, stored transcript, evaluation artifact) and message/tool schemas.
3. Required components from `docs/research/ai-elements/*.md` (list names upfront).
4. Styling or theming constraints if deviating from defaults.

## Implementation Flow
1. **Component Selection**  
   - Review the relevant markdown (e.g., `tool.md`, `message.md`, `plan.md`) to understand props, preview states, and install snippets.  
   - Note any supporting primitives (Buttons, CodeBlock, MessageResponse) referenced in the doc.
2. **Wiring to AI SDK**  
   - Follow the usage sections showing how to compose with `useChat`, `DefaultChatTransport`, or `ToolUIPart` typing.  
   - Ensure tool parts are discriminated via `part.type === 'tool-<name>'` before rendering the AI Element.
3. **State & Interaction**  
   - Preserve the collapsible/animated affordances (e.g., `Collapsible`, progress indicators) provided in examples.  
   - Support streaming states (`input-streaming`, `input-available`, `output-available`, `output-error`) exactly as described.
4. **Styling & Accessibility**  
   - Keep the className scaffolding from docs unless a design token override is warranted; maintain focus rings and keyboard shortcuts.  
   - Document any overrides in-line for future contributors.
5. **Testing**  
   - Render each state showcased in the doc (pending, running, completed, error) using storybook-like fixtures or unit tests.  
   - Verify hydration by exercising the actual AI SDK hook or by mocking `messages` arrays.

## Deliverables
- Updated component(s) wired to live data, plus fixtures/stories covering each state.  
- Brief summary referencing the specific AI Elements docs used.

## Verification Checklist
- ✅ Snapshot of UI states or storybook URLs.  
- ✅ ESLint/TypeScript clean.  
- ✅ If AI SDK hooks are mocked, include TODO referencing real transport integration.

## Reference Index
- `docs/research/ai-elements/tool.md` – Tool UI scaffolding for `ToolUIPart` rendering.
- `docs/research/ai-elements/message.md` – Message shells, inline citations, streaming cursors.
- `docs/research/ai-elements/plan.md`, `artifact.md`, `checkpoint.md` – Planning + progress surfaces.
- Remaining files provide context, suggestions, tasks, queue + shimmer components; cite whichever you import.
