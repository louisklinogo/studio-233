import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { checkBotId } from "botid/server";
import { type NextRequest } from "next/server";
import { createContext } from "@/server/trpc/context";
import { appRouter } from "@/server/trpc/routers/_app";

const handler = (req: NextRequest) => {
	console.log(`[TRPC API] Incoming request: ${req.url}`);
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req),
		onError: ({ path, error }) => {
			console.error(
				`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
			);
			if (error.cause) console.error("Error cause:", error.cause);
		},
	});
};

const protectedHandler = async (req: NextRequest) => {
	// Only check for bots on POST requests (mutations) and on Vercel
	if (req.method === "POST" && process.env.VERCEL === "1") {
		try {
			const verification = await checkBotId();
			if (verification.isBot) {
				return new Response("Access denied", { status: 403 });
			}
		} catch (error) {
			console.warn("BotId verification failed, allowing request", error);
		}
	}
	return handler(req);
};

export { handler as GET, protectedHandler as POST };
