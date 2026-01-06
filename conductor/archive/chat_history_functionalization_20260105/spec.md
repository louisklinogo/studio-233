# Track Specification: Chat History Functionalization (Threads & Media)

## Overview
Transform the currently static Chat History UI into a functional, theme-aware dual-mode log. This track focuses on enabling rapid retrieval of previous conversations ("Threads") and visual experiments ("Media") conducted within the Chat Panel.

## Functional Requirements

### 1. Threads (Log) Tab
- **Chronological List**: Display a vertical feed of `AgentThread` objects, showing the title, a snippet of the latest message, and a relative timestamp (e.g., "5m ago").
- **Search & Filter**: A top-mounted search bar to filter threads by title or snippet content.
- **Destructive Actions**: Inline "Delete" capability for each thread, triggering a confirmation before removing the thread and its associated messages from the database.
- **Thread Selection**: Clicking a thread switches the active conversation context in the Chat Panel and populates the message history.

### 2. Media Tab
- **Visual Scratchpad**: A grid-based gallery displaying all `Asset` objects generated or uploaded during chat sessions across the entire project.
- **Smart Filtering**: Items are identified by checking the `Asset.metadata` for a `threadId` field.
- **Infinite Canvas Bridge**: Full support for dragging an asset from the Media tab and dropping it onto the React Konva canvas.
- **Technical Readout**: On hover or selection, display a minimalist "Spec" overlay showing dimensions, file type, and the ID of the thread that generated it.

## Technical Requirements

### Backend & API (tRPC)
- **Asset Tagging**: Update chat-triggered generation logic to inject the current `threadId` into the `Asset.metadata` object upon registration.
- **Media Retrieval**: Create a new tRPC procedure `asset.getChatMedia` that queries the `Asset` table for items in the current workspace where `metadata->'threadId'` is not null.
- **Thread Management**: Ensure `agent.deleteThread` correctly cleans up or orphans associated assets based on project cleanup policies.

### Frontend & UI
- **Theme-Aware Components**: Utilize the recently refactored semantic Tailwind classes (`bg-background`, `border-border`, etc.) to ensure both tabs work perfectly in light and dark modes.
- **Mechanical UX**: Adhere to the "Braun-ish" aesthetic—sharp edges, zero border-radius on action buttons, and high-contrast tactile feedback.
- **Optimistic Updates**: Implement optimistic UI for thread deletion and tab switching to maintain a high-performance "Creative OS" feel.

## Acceptance Criteria
- [ ] Users can switch between "Threads" and "Media" tabs without layout shifts.
- [ ] Deleting a thread removes it from the list and the DB.
- [ ] Searching in the "Threads" tab filters the list in real-time.
- [ ] The "Media" tab correctly displays images generated from chat sessions.
- [ ] Assets from the "Media" tab can be dragged onto the canvas and successfully instantiated as canvas elements.

## Out of Scope
- The "Tasks/Apps" tab (removed for a cleaner two-tab interface).
- Advanced image editing within the Media tab (remains in the Inspector/Studio).
