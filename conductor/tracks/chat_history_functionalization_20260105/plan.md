# Implementation Plan: Chat History Functionalization

Functionalize the "Threads" and "Media" tabs in the Chat Panel with a robust backend integration and theme-aware UI.

## Phase 1: Backend Hardening & API Extension
**Goal:** Prepare the data layer to support chat-specific media tracking and retrieval.

- [x] **Task: Update Asset Registration for Chat Context** [2179d72]
- [x] **Task: Create `asset.getChatMedia` tRPC Procedure** [2179d72]
- [ ] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)**

## Phase 2: Threads (Log) Tab Functionality
**Goal:** Implement full lifecycle management for conversations.

- [x] **Task: Implement Search & Filter for Threads** [2179d72]
- [x] **Task: Add Destructive Actions (Delete Thread)** [2179d72]
- [ ] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**

## Phase 3: Media Tab (The Results Bin)
**Goal:** Build the visual scratchpad and its bridge to the canvas.

- [x] **Task: Implement Media Grid Rendering** [2179d72]
- [x] **Task: Implement Canvas Bridge (Drag & Drop)** [2179d72]
- [x] **Task: Add Minimalist Spec Readout** [2179d72]
- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**

## Phase 4: UX Polishing & Theme Integration
**Goal:** Final aesthetic alignment and UI stability.

- [x] **Task: Remove Third Tab & Refactor Tab Navigation** [2179d72]
- [x] **Task: Final Theme Audit** [2179d72]
- [ ] **Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)**
