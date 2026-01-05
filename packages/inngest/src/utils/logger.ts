export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogPayload extends Record<string, unknown> {
	level: LogLevel;
	event: string;
	ts: string;
	message?: string;
	error?: string;
	durationMs?: number;
}

class Logger {
	constructor(private context: Record<string, unknown> = {}) {}

	child(additionalContext: Record<string, unknown>): Logger {
		return new Logger({ ...this.context, ...additionalContext });
	}

	private log(
		level: LogLevel,
		event: string,
		meta: Record<string, unknown> = {},
	) {
		const payload: LogPayload = {
			level,
			event,
			ts: new Date().toISOString(),
			...this.context,
			...meta,
		};

		if (process.env.NODE_ENV === "development") {
			const { ts, level, event, message, ...rest } = payload;
			const color =
				level === "error"
					? "\x1b[31m"
					: level === "warn"
						? "\x1b[33m"
						: "\x1b[32m";
			const reset = "\x1b[0m";

			console[
				level === "debug"
					? "debug"
					: level === "error"
						? "error"
						: level === "warn"
							? "warn"
							: "info"
			](
				`[${ts}] ${color}${level.toUpperCase()}${reset} ${event}${message ? `: ${message}` : ""}`,
				Object.keys(rest).length > 0 ? rest : "",
			);
		} else {
			console[
				level === "debug"
					? "debug"
					: level === "error"
						? "error"
						: level === "warn"
							? "warn"
							: "info"
			](JSON.stringify(payload));
		}
	}

	debug(event: string, meta?: Record<string, unknown>) {
		this.log("debug", event, meta);
	}

	info(event: string, meta?: Record<string, unknown>) {
		this.log("info", event, meta);
	}

	warn(event: string, meta?: Record<string, unknown>) {
		this.log("warn", event, meta);
	}

	error(event: string, meta?: Record<string, unknown>) {
		this.log("error", event, meta);
	}
}

export const logger = new Logger();
export default logger;
