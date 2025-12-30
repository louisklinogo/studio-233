import {
	archiveVisionResult,
	brandIngestion,
	cleanupVisionTemp,
	createProcessStudioWorkflow,
	inngest,
	processFashionItem,
	processWorkflowRun,
} from "@studio233/inngest";
import { serve } from "inngest/next";
import type { NextRequest } from "next/server";
import {
	coerceMediaFile,
	getStudioPlugin,
	validateStudioPluginConfig,
} from "@/server/studio-workflow/plugin-registry";

// Inject app-specific registry logic into the shared workflow function
const processStudioWorkflow = createProcessStudioWorkflow({
	coerceMediaFile,
	getPlugin: getStudioPlugin,
	validateConfig: validateStudioPluginConfig,
});

type RouteContext = { params: Promise<Record<string, string>> };
type AppRouteHandler = (
	request: NextRequest,
	context: RouteContext,
) => Response | Promise<Response>;

const handlers = serve({
	client: inngest,
	functions: [
		processStudioWorkflow,
		brandIngestion,
		archiveVisionResult,
		processFashionItem,
		processWorkflowRun,
		cleanupVisionTemp,
	],
});

const adapt = <T extends keyof typeof handlers>(method: T) => {
	const handler = handlers[method] as (
		...args: any[]
	) => Promise<Response> | Response;
	return ((request, context) =>
		handler(request, context)) satisfies AppRouteHandler;
};

export const GET = adapt("GET");
export const POST = adapt("POST");
export const PUT = adapt("PUT");
