### Studio workflow modernization plan

1. ✅ Add TRPC workflow endpoints (CRUD) backed by KV; wired into app router. ✅ Added start/status stubs writing to `workflowRun`.
2. 🚧 Wrap execution behind an interface with Inngest (per-node handlers, status/log storage, polling/SSE) — still to implement.
3. ✅ Ported core UI pieces: toolbar (add/fit/minimap), node cards (trigger/action/add), minimap toggle, selection-aware config panel, React Flow shell.
4. ✅ Autosave debounce on edits; dirty flag reset on save. Sidebar prefs persistence still pending.
5. 🚧 Hook batch pipeline: add batch-run node and surface logs via right panel; connect to Inngest execution.
6. 🚧 Replace `/studio/[id]` with new experience behind a flag after `/studio-experiments/[id]` hardening.
7. 🚧 Tests: store reducer/unit, component interactions, TRPC + Inngest integration, E2E add→save→execute.
8. 🚧 Inngest run flow + log surface: wire TRPC run subscription/polling, persist runs list, and render log/status panel on the right.
9. 🚧 Batch node model + config: enrich node types for ingest/transform/export, add node palette/context menu, and build selection-aware config panel.
10. 🚧 Toolbar upgrades: undo/redo/delete/clear, fit/minimap, run with missing-integration checks, and quick add controls aligned to Braun-ish Swiss UI.
11. 🚧 Persistence + rollout: store sidebar/minimap/view prefs, snapshot workflow versions, gate new `/studio` behind a flag and swap when stable.
12. 🚧 Coverage: add unit/integration tests for store mutations, TRPC workflow CRUD/run, React Flow interactions (connect/add), autosave, and log rendering.



---------------------------------------
When one lands on dashboard page, do we need to do an onboarding journey using cards or something? esp for the brand management part?

When one deletes, whats the ux? i think rn there is none?
