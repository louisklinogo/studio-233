import { auth } from "@studio233/auth";

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
		message?.includes("EAI_AGAIN") ||
		message?.includes("ETIMEDOUT")
	);
}

export async function getSessionSafe(
	headersSource: HeaderSource,
	options: { retries?: number; delayMs?: number } = {},
) {
	const maxRetries = options.retries ?? 2;
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
				delay *= 2;
				continue;
			}
			console.error("[auth] getSessionSafe failed", error);
			return null;
		}
	}

	console.error("[auth] getSessionSafe exhausted retries", lastError);
	return null;
}
