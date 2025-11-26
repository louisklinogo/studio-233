import { PostgresStore } from "@mastra/pg";

import { getEnv } from "./config";

const env = getEnv();

export const mastraStore = new PostgresStore({
	connectionString: env.mastraDatabaseUrl,
	schemaName: env.mastraSchema,
});
