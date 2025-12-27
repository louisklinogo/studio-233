import { appRouter } from "./apps/web/src/server/trpc/routers/_app";
import { workspaceRouter } from "./apps/web/src/server/trpc/routers/workspace";

type AppRouter = typeof appRouter;
type WorkspaceRouter = typeof workspaceRouter;

// Check if workspace is in AppRouter
type WorkspaceInApp = AppRouter["_def"]["procedures"]["workspace"];

console.log("Type check file created.");
