import { Langfuse } from "langfuse";

let client: Langfuse | null = null;

function getClient() {
	if (client) return client;
	const secretKey = process.env.LANGFUSE_SECRET_KEY;
	const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
	const baseUrl = process.env.LANGFUSE_BASE_URL ?? "https://cloud.langfuse.com";
	if (!secretKey || !publicKey) return null;
	client = new Langfuse({ secretKey, publicKey, baseUrl });
	return client;
}

export function emitLangfuseEvent(
	event: string,
	level: "info" | "warn" | "error",
	meta: Record<string, unknown> = {},
): void {
	const c = getClient();
	if (!c) return;

	try {
		c.event({
			name: event,
			type: level,
			metadata: meta,
		});
	} catch (error) {
		// Fail open: logging should not break execution
	}
}
