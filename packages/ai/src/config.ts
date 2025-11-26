import "dotenv/config";

type Env = {
	mastraDatabaseUrl: string;
	mastraSchema?: string;
	falKey?: string;
	googleApiKey?: string;
	searchApiKey?: string;
	exaApiKey?: string;
	siteExtractorKey?: string;
	ffmpegPath?: string;
	tavilyBaseUrl?: string;
	exaBaseUrl?: string;
};

let cachedEnv: Env | null = null;

export function getEnv(): Env {
	if (cachedEnv) return cachedEnv;

	const mastraDatabaseUrl =
		process.env.MASTRA_DATABASE_URL ??
		process.env.DATABASE_URL ??
		process.env.POSTGRES_PRISMA_URL;

	if (!mastraDatabaseUrl) {
		throw new Error(
			"MASTRA_DATABASE_URL or DATABASE_URL must be defined for @studio233/ai",
		);
	}

	cachedEnv = {
		mastraDatabaseUrl,
		mastraSchema: process.env.MASTRA_SCHEMA,
		falKey: process.env.FAL_KEY,
		googleApiKey:
			process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY,
		searchApiKey:
			process.env.TAVILY_API_KEY ??
			process.env.BRAVE_API_KEY ??
			process.env.SERPAPI_API_KEY,
		exaApiKey: process.env.EXA_API_KEY,
		siteExtractorKey: process.env.SCRAPER_API_KEY,
		ffmpegPath: process.env.FFMPEG_PATH,
		tavilyBaseUrl:
			process.env.TAVILY_API_BASE_URL ?? "https://api.tavily.com/search",
		exaBaseUrl: process.env.EXA_API_BASE_URL ?? "https://api.exa.ai/search",
	};

	return cachedEnv;
}
