class Logger {
	constructor(context = {}) {
		this.context = context;
	}
	child(additionalContext) {
		return new Logger({ ...this.context, ...additionalContext });
	}
	log(level, event, meta = {}) {
		const payload = {
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
	debug(event, meta) {
		this.log("debug", event, meta);
	}
	info(event, meta) {
		this.log("info", event, meta);
	}
	warn(event, meta) {
		this.log("warn", event, meta);
	}
	error(event, meta) {
		this.log("error", event, meta);
	}
}
export const logger = new Logger();
export default logger;
