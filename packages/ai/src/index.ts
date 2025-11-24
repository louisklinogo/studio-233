import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { PinoLogger } from '@mastra/loggers';
import { backgroundRemovalWorkflow } from './workflows/background-removal';
import { objectIsolationWorkflow } from './workflows/object-isolation';

/**
 * Mastra AI instance for Studio+233
 * 
 * This configures the AI workflows, agents, and observability.
 * Additional agents from src/mastra/agents will be migrated during app migration.
 */
export const mastra = new Mastra({
    workflows: {
        backgroundRemovalWorkflow,
        objectIsolationWorkflow,
        // Additional workflows to be added during migration
    },
    agents: {
        // Agents will be migrated from src/mastra/agents
    },
    scorers: {
        // Scorers will be migrated from src/mastra/scorers
    },
    storage: new LibSQLStore({
        // In-memory storage for development
        // Change to file:../mastra.db for persistence
        url: ':memory:',
    }),
    logger: new PinoLogger({
        name: 'Studio233-Mastra',
        level: 'info',
    }),
    telemetry: {
        enabled: false,
    },
    observability: {
        default: { enabled: true },
    },
});

// Re-export workflows for convenience
export { backgroundRemovalWorkflow } from './workflows/background-removal';
export { objectIsolationWorkflow } from './workflows/object-isolation';
