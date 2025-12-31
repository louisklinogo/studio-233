import { Polar } from "@polar-sh/sdk";

let cachedClient: Polar | null | undefined;

export function getPolarClient(): Polar | null {
	if (cachedClient !== undefined) {
		return cachedClient;
	}
	const accessToken = process.env.POLAR_ACCESS_TOKEN;
	if (!accessToken) {
		if (process.env.NODE_ENV !== "production") {
			console.warn(
				"POLAR_ACCESS_TOKEN is not configured; Polar features are disabled.",
			);
		}
		cachedClient = null;
		return cachedClient;
	}
	cachedClient = new Polar({ accessToken });
	return cachedClient;
}
