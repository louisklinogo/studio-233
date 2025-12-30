# Specification: Vision Pipeline Hardening & "Industrial-Scale" Resilience

**Track ID:** `vision_resilience_20251230`
**Type:** Infrastructure Hardening
**Status:** Approved

## 1. Overview
Hardens the vision analysis pipeline by replacing "fickle" URL-based fetching with a resilient, content-addressed system. This ensures 100% deduplication of AI costs, robust network error recovery, and zero-redundancy execution across distributed server instances.

## 2. Core Architecture

### 2.1 Content-Addressable Storage (CAS)
- **Byte-Level Hashing:** Images are hashed via `SHA-256` (using `Bun.CryptoHasher`) during the download stream.
- **Deterministic Storage:** Assets are stored in Vercel Blob at `vision/source/${sha256}` and metadata at `vision/metadata/${sha256}/latest.json` without randomized suffixes.
- **Fast-Path GET:** Cache lookups use direct `HEAD`/`GET` requests, bypassing the slow `list()` operation.

### 2.2 Robust Fetcher & Binary Injection
- **Resilient Fetch:** Implements 3 retries with exponential backoff and a 20s timeout.
- **Local Buffering:** Assets stream directly to `/tmp` via `Bun.write`.
- **SDK Control:** Injects `Uint8Array` from the local buffer into the AI SDK, bypassing the SDK's internal 10s downloader.

### 2.3 Distributed Request Coalescing
- **Flight Registry:** Uses Vercel KV and Inngest idempotency keys (based on the SHA-256 hash) to ensure only ONE instance across the fleet processes a specific image at any given time.

## 3. Acceptance Criteria
1. **Deduplication:** Multiple concurrent requests for the same image trigger exactly one AI model call.
2. **Deterministic Lookup:** Cache hits occur via `GET` without invoking any `list` operations.
3. **Resilience:** System recovers from a simulated 5s network stall via backoff retries.
4. **Storage Hygiene:** `/tmp` files are pruned via an Inngest background job after a 5-minute safety window.

## 4. Out of Scope
- Migrating to a different storage provider.
