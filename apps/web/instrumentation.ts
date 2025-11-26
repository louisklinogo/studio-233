import { registerOTel } from "@vercel/otel";

export function register() {
	(globalThis as any).___MASTRA_TELEMETRY___ = true;

	registerOTel({
		serviceName: "studio-233-web",
	});
}
