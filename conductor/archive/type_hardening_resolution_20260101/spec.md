# Specification: Monorepo Type Hardening and Resolution

## Overview
This track focuses on achieving a clean, error-free TypeScript build across the entire `studio+233` monorepo. As the project matures, type regressions can slow down CI/CD and introduce runtime bugs. This task will systematically identify, diagnose, and resolve type errors while maintaining the architectural integrity of the system.

## Functional Requirements
- **Global Type Check:** Successfully run `bun x tsc --noEmit` across all packages and apps without errors.
- **Systematic Resolution:**
    - Prioritize fixing errors at the source (e.g., in `@studio233/db` or `@studio233/api`) before fixing downstream consumers.
    - Improve interface definitions where types are currently ambiguous or overly broad.
- **Architectural Integrity:** Ensure that type changes do not alter existing runtime logic or performance characteristics.

## Non-Functional Requirements
- **Strictness:** Maintain existing `tsconfig.json` strictness levels.
- **Documentation:** Any use of `@ts-expect-error` must be accompanied by a clear comment explaining why the error cannot be resolved properly at this time.
- **Technical Debt Management:** 
    - All `@ts-expect-error` instances must be tagged with `[DEBT-TS]`.
    - A summary of all deferred type resolutions must be recorded in the final track report to inform future refactoring tracks.
- **Code Style:** All changes must pass Biome linting and formatting.

## Acceptance Criteria
1. `turbo run type-check` (or equivalent global tsc command) exits with code 0.
2. `bun test` passes for all core packages and the web app.
3. `bun x biome check .` passes without warnings or errors.
4. No new `any` types are introduced unless strictly necessary and documented.

## Out of Scope
- Major architectural refactoring of the state management or canvas engine (unless required to fix a critical type error).
- Addition of new features or UI changes.
