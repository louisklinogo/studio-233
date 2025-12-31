import { NextRequest } from "next/server";

export async function createContext(req?: NextRequest) {
	console.log(`[TRPC Context] Creating context for ${req?.method} ${req?.url}`);
	return {
		req,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
