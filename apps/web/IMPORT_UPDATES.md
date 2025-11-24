# Import Update Strategy

## Overview

The app has been moved to `apps/web/`. Now we need to update imports to use workspace packages where appropriate.

## Import Mapping Rules

### ✅ Update to Workspace Packages

| Old Import | New Import | Package |
|------------|------------|---------|
| `@/types/elements` | `@studio233/canvas` | Canvas types |
| `@/types/canvas` | `@studio233/canvas` | Canvas types |
| `@/types/studio` | Keep as-is | App-specific types |
| `@/server/trpc/*` (routers) | Will migrate to `@studio233/api` | Future: tRPC routers |
| `@/mastra` | `@studio233/ai` | AI workflows |

### ⛔ Keep Local (Don't Change)

These should remain as `@/*` imports because they're app-specific:
- `@/components/*` - UI components (app-specific)
- `@/hooks/*` - React hooks
- `@/lib/*` - App utilities
- `@/utils/*` - Helper functions
- `@/app/*` - Next.js app router
- `@/inngest/*` - Inngest functions

## Files That Need Updates

Based on grep search, these files import from `@/types/elements` or `@/types/canvas`:
- `apps/web/src/hooks/useCanvasState.ts`
- `apps/web/src/hooks/useCanvasElements.ts`
- `apps/web/src/components/studio/properties/PropertiesBar.tsx`
- `apps/web/src/components/canvas/CanvasDrawing.tsx`
- `apps/web/src/components/canvas/CanvasShape.tsx`
- `apps/web/src/components/canvas/CanvasText.tsx`
- `apps/web/src/components/canvas/CanvasStage.tsx`
- And ~20 more canvas-related components

## Implementation Steps

1. ✅ Update `@/types/elements` → `@studio233/canvas`
2. ✅ Update `@/types/canvas` → `@studio233/canvas`
3. ⏳ Keep `@/server/trpc` for now (will migrate routers later)
4. ⏳ Delete old  `/types/` directory after migration
5. ⏳ Delete old `src/server/trpc/routers/` after migrating to `@studio233/api`
6. ⏳ Delete old `src/mastra/` after confirming `@studio233/ai` works

## Next Actions

I'll update the imports in batches:
1. Start with type imports (elements, canvas)
2. Test build
3. Move to tRPC routers later (separate task)
