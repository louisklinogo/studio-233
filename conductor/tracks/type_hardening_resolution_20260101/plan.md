# Implementation Plan: Monorepo Type Hardening

## Phase 1: Core Package Hardening (Bottom-Up)
*Goal: Ensure the foundation packages are type-safe to prevent error cascading.*

- [x] Task: Audit global type state - Run `turbo run type-check` and pipe to `build-issues.txt` for baseline. 775b0bd
- [x] Task: Harden `@studio233/brand` package - Resolve errors and update interfaces. 835e8dc
- [ ] Task: Harden `@studio233/db` package - Fix Prisma client types and repository patterns.
- [ ] Task: Harden `@studio233/api` package - Fix tRPC router and context types.
- [ ] Task: Conductor - User Manual Verification 'Core Hardening' (Protocol in workflow.md)

## Phase 2: Application Layer Resolution
*Goal: Fix errors in the Next.js app that depend on the core packages.*

- [ ] Task: Resolve `apps/web` components - Focus on Konva and React Flow integration types.
- [ ] Task: Resolve `apps/web` server-side logic - API route handlers and server actions.
- [ ] Task: Resolve Workspace-level configuration types (vite/next config, etc).
- [ ] Task: Conductor - User Manual Verification 'App Hardening' (Protocol in workflow.md)

## Phase 3: Validation and Technical Debt Audit
*Goal: Ensure no regressions and document deferred fixes.*

- [ ] Task: Global Validation - Run `turbo run type-check && bun x biome check . && bun test`.
- [ ] Task: Technical Debt Audit - Extract all `[DEBT-TS]` tags into a summary report.
- [ ] Task: Conductor - User Manual Verification 'Final Validation' (Protocol in workflow.md)
