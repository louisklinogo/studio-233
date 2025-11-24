import { router } from './trpc';
import { projectsRouter } from './routers/projects';

/**
 * Main App Router
 * 
 * This combines all sub-routers. Additional routers from src/server/trpc/routers
 * will be migrated here during the app migration phase.
 */
export const appRouter = router({
    projects: projectsRouter,
    // gemini: will be moved from src/server/trpc/routers/gemini
    // Additional routers to be added during migration
});

export type AppRouter = typeof appRouter;

// Re-export utilities
export { createContext } from './context';
export { createCallerFactory, publicProcedure, protectedProcedure } from './trpc';
export type { Context } from './context';
