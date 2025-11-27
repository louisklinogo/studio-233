import { PostgresStore } from "@mastra/pg";

import { getEnv } from "./config";

const env = getEnv();

// Ensure we only create a single PostgresStore instance across hot reloads
// and serverless invocations, to avoid duplicate DB objects for the same
// connection.
declare global {
	// eslint-disable-next-line no-var
	var __STUDIO233_MASTRA_STORE__: PostgresStore | undefined;
}

const globalForMastra = globalThis as typeof globalThis & {
	__STUDIO233_MASTRA_STORE__?: PostgresStore;
};

export const mastraStore: PostgresStore =
	globalForMastra.__STUDIO233_MASTRA_STORE__ ??
	new PostgresStore({
		connectionString: env.mastraDatabaseUrl,
		schemaName: env.mastraSchema,
	});

if (!globalForMastra.__STUDIO233_MASTRA_STORE__) {
	globalForMastra.__STUDIO233_MASTRA_STORE__ = mastraStore;
}
