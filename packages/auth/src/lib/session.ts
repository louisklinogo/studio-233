import { auth } from "../index";

type HeaderSource = Headers | Record<string, string> | null | undefined;

function normalizeHeaders(source: HeaderSource): Headers {
	if (source instanceof Headers) return source;
	return new Headers(source ?? {});
}

function isTransientNetworkError(error: unknown): boolean {
	const code = (error as any)?.code as string | undefined;
	const message = (error as any)?.message as string | undefined;
	return (
		code === "EAI_AGAIN" ||
		code === "ETIMEDOUT" ||
		code === "ECONNRESET" ||
		(message?.includes("EAI_AGAIN") ?? false) ||
		(message?.includes("ETIMEDOUT") ?? false) ||
		(message?.includes("getaddrinfo") ?? false) ||
		(message?.includes("ECONNRESET") ?? false) ||
		(message?.includes("Connection terminated") ?? false)
	);
}

export async function getSessionWithRetry(
	headersSource: HeaderSource = undefined,
	options: { retries?: number; delayMs?: number } = {},
) {
	const maxRetries = options.retries ?? 4;
	let delay = options.delayMs ?? 200;
	const headers = normalizeHeaders(headersSource);
	let lastError: unknown;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await auth.api.getSession({ headers });
		} catch (error) {
			lastError = error;
			if (isTransientNetworkError(error) && attempt < maxRetries) {
				await new Promise((resolve) => setTimeout(resolve, delay));
				delay = Math.min(delay * 2, 2_000);
				continue;
			}
			console.error("[auth] getSessionWithRetry failed", error);
			return null;
		}
	}

	console.error("[auth] getSessionWithRetry exhausted retries", lastError);
	return null;
}
