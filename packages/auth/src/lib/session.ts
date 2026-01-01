import { auth } from "../index";

type HeaderSource = Headers | Record<string, string> | null | undefined;

function normalizeHeaders(source: HeaderSource): Headers {
	if (source instanceof Headers) return source;
	return new Headers(source ?? {});
}

function isTransientNetworkError(error: unknown): boolean {
	if (!error) return false;

	const err = error as any;
	const code = err.code as string | undefined;
	const message = err.message as string | undefined;
	const status = err.status as string | undefined;
	const bodyMessage = err.body?.message as string | undefined;
	const bodyCode = err.body?.code as string | undefined;

	const isTransientCode = (c: string | undefined) =>
		c === "EAI_AGAIN" ||
		c === "ETIMEDOUT" ||
		c === "ECONNRESET" ||
		c === "ECONNREFUSED" ||
		c === "P2024" || // Prisma: Connection timed out
		c === "P2028"; // Prisma: Transaction API error

	const isTransientMessage = (m: string | undefined) =>
		m?.includes("EAI_AGAIN") ||
		m?.includes("ETIMEDOUT") ||
		m?.includes("getaddrinfo") ||
		m?.includes("ECONNRESET") ||
		m?.includes("Connection terminated") ||
		m?.includes("timed out") ||
		m?.includes("Timeout");

	if (isTransientCode(code) || isTransientCode(bodyCode)) return true;
	if (isTransientMessage(message) || isTransientMessage(bodyMessage))
		return true;

	// Check for wrapped errors (Better Auth often wraps Prisma errors)
	if (err.cause) return isTransientNetworkError(err.cause);

	return false;
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
