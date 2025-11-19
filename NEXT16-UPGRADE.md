# Next.js 16 Migration Summary

## Completed Updates
- Upgraded core stack to `next@16`, `react@19.2`, and `react-dom@19.2` with Bun 1.3 tooling.
- Switched project workflows to Bun and Biome (`bunx next`, `bunx biome`) and removed npm/ESLint artifacts.
- Bumped key runtime deps to the latest compatible releases:
  - `@fal-ai/client@^1.7`
  - `@tanstack/react-query@^5.90`
  - `@trpc/*@^11.5`
  - `lucide-react@^0.546`
  - `react-konva@^19.0.8`
  - `lint-staged@^16`

## Deferred Items
- **Tailwind CSS v4.x**: major engine rewrite; requires separate styling regression plan.
- **Konva v10**: breaking API changes; revisit once canvas regression window is scheduled.
- **RainbowKit 2.2.9+**: awaiting npm publication to avoid registry mismatch.

## Follow-Up Actions
- Adopt Cache Components/PPR in static shells after verifying CI/regression results.
- Monitor Bun lockfile stability; regenerate with `bun install` on dependency changes.
- Schedule dedicated spikes for Tailwind v4 and Konva v10 migrations.
