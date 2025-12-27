import "dotenv/config";

type Env = {
	databaseUrl?: string;
	databaseSchema?: string;
	falKey?: string;
	googleApiKey?: string;
	searchApiKey?: string;
	exaApiKey?: string;
	siteExtractorKey?: string;
	ffmpegPath?: string;
	tavilyBaseUrl: string;
	exaBaseUrl: string;
	blobHostname?: string;
};

let cachedEnv: Env | null = null;

export function getEnv(): Env {
	if (cachedEnv) return cachedEnv;

	const databaseUrl =
		process.env.AI_DATABASE_URL ??
		process.env.WORKFLOWS_DATABASE_URL ??
		process.env.MASTRA_DATABASE_URL ??
		process.env.DATABASE_URL ??
		process.env.POSTGRES_PRISMA_URL;

	const databaseSchema =
		process.env.AI_DATABASE_SCHEMA ??
		process.env.WORKFLOWS_DATABASE_SCHEMA ??
		process.env.MASTRA_SCHEMA ??
		process.env.DATABASE_SCHEMA;

	cachedEnv = {
		databaseUrl,
		databaseSchema,
		falKey: process.env.FAL_KEY,
		googleApiKey:
			process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY,
		searchApiKey: process.env.TAVILY_API_KEY,
		exaApiKey: process.env.EXA_API_KEY,
		siteExtractorKey: process.env.SCRAPER_API_KEY,
		ffmpegPath: process.env.FFMPEG_PATH,
		tavilyBaseUrl:
			process.env.TAVILY_API_BASE_URL ?? "https://api.tavily.com/search",
		exaBaseUrl: process.env.EXA_API_BASE_URL ?? "https://api.exa.ai/search",
		blobHostname: process.env.BLOB_HOSTNAME,
	};

	return cachedEnv;
}
