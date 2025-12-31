import { auth, type Session } from "@studio233/auth";
import { NextRequest } from "next/server";

export async function createContext(req?: NextRequest) {
	let session: Session | null = null;

	// Extract session from auth if request is available
	if (req) {
		try {
			const authSession = await auth.api.getSession({ headers: req.headers });
			session = authSession ? (authSession.session as Session) : null;
		} catch (error) {
			console.error("Failed to get session:", error);
		}
	}

	return {
		req,
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
