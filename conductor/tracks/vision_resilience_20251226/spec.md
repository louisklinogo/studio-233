# Specification: Vision Analysis Workflow Resilience & Async Archival

## 1. Overview
This feature hardens the `vision-analysis` workflow against transient network failures (like Vercel Blob timeouts) and decouples asset archiving from the real-time AI response path. The goal is to ensure the user receives an AI analysis as fast as the model can generate it, regardless of storage latency or failures.

## 2. Functional Requirements

### 2.1 Optimistic Parallelism with Robust Fallback
- The workflow MUST initiate the "Cache Lookup" and "AI Generation" tasks in parallel.
- **Cache Lookup:**
  - Must have a strict, short timeout (e.g., 2000ms).
  - If it times out or fails (e.g., `fetch failed`), it MUST resolve to `null` and NOT throw an error that crashes the workflow.
- **AI Generation:**
  - MUST use the provided `imageUrl` directly.
  - MUST NOT wait for any image downloading or snapshotting to complete before starting.

### 2.2 Asynchronous Asset Archival (Inngest)
- The workflow MUST NOT perform blocking uploads to Vercel Blob during the user request lifecycle.
- Instead of uploading directly, the workflow MUST trigger an Inngest event:
  - **Event Name:** `vision.archive.requested`
  - **Payload:** `imageUrl`, `imageHash`, `metadata` (the AI result).
- **Inngest Function (`archive-vision-result`):**
  - Handles the downloading of the source image.
  - Handles the uploading of the source snapshot to Vercel Blob.
  - Handles the uploading of the AI metadata JSON to Vercel Blob.
  - Includes retry logic for network failures.

### 2.3 Error Handling
- **Transient Network Errors:** Failures in cache lookup or image downloading MUST be swallowed or handled in the background. They MUST NOT prevent the AI result from being returned if the AI generation was successful.
- **AI Failure:** Only if the AI model itself fails (e.g., API error) should the tool throw an error to the user.

## 3. Non-Functional Requirements
- **Latency:** The response time should be dominated solely by the Gemini model generation time (approx. 3-5s for Flash), not storage I/O.
- **Scalability:** Heavy file operations are offloaded to background workers.

## 4. Out of Scope
- Changing the actual AI prompts or model logic (this is purely infrastructure).
- UI changes in the chat panel.
