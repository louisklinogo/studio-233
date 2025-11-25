"use server";

import { PostgresStore } from "@mastra/pg";

const connectionString =
	process.env.MASTRA_DATABASE_URL ??
	process.env.DATABASE_URL ??
	process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
	throw new Error(
		"MASTRA_DATABASE_URL or DATABASE_URL must be set to use Mastra storage.",
	);
}

export const mastraStore = new PostgresStore({
	connectionString,
	schemaName: process.env.MASTRA_SCHEMA,
});
