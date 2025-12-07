import { emitLangfuseEvent } from "../telemetry/langfuse";

type LogLevel = "info" | "warn" | "error";

function log(
	level: LogLevel,
	event: string,
	meta: Record<string, unknown> = {},
) {
	const payload = { level, event, ts: new Date().toISOString(), ...meta };
	if (level === "error") {
		console.error(payload);
	} else if (level === "warn") {
		console.warn(payload);
	} else {
		console.info(payload);
	}

	// Fire-and-forget to Langfuse if configured
	emitLangfuseEvent(event, level, meta);
}

export const logger = {
	info: (event: string, meta?: Record<string, unknown>) =>
		log("info", event, meta),
	warn: (event: string, meta?: Record<string, unknown>) =>
		log("warn", event, meta),
	error: (event: string, meta?: Record<string, unknown>) =>
		log("error", event, meta),
};
