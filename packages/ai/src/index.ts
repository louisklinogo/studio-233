import { Mastra } from "@mastra/core/mastra";
import { PostgresStore } from "@mastra/pg";
import { PinoLogger } from "@mastra/loggers";
import { backgroundRemovalWorkflow } from "./workflows/background-removal";
import { objectIsolationWorkflow } from "./workflows/object-isolation";

/**
 * Mastra AI instance for Studio+233
 * 
 * This configures the AI workflows, agents, and observability.
 * Additional agents from src/mastra/agents will be migrated during app migration.
 */
const connectionString =
	process.env.MASTRA_DATABASE_URL ??
	process.env.DATABASE_URL ??
	process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
	throw new Error(
		"MASTRA_DATABASE_URL or DATABASE_URL must be set to initialize Mastra.",
	);
}

const storage = new PostgresStore({
	connectionString,
	schemaName: process.env.MASTRA_SCHEMA,
});

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
	storage,
	logger: new PinoLogger({
		name: "Studio233-Mastra",
		level: "info",
	}),
	telemetry: {
		enabled: false,
	},
	observability: {
		default: { enabled: true },
	},
});

// Re-export workflows for convenience
export { backgroundRemovalWorkflow } from "./workflows/background-removal";
export { objectIsolationWorkflow } from "./workflows/object-isolation";
