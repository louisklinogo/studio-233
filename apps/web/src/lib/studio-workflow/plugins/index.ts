import { backgroundRemovalPlugin } from "./background-removal";
import { formatConversionPlugin } from "./format-conversion";
import { imageResizePlugin } from "./image-resize";
import { mediaInputPlugin } from "./media-input";
import { mediaOutputPlugin } from "./media-output";
import { pluginRegistry } from "./registry";
import type {
	MediaFile,
	MediaPlugin,
	MediaProcessingResult,
	PluginConfig,
	PluginExecutionContext,
} from "./types";

// List of all available plugins
const availablePlugins: MediaPlugin[] = [
	// Input plugins
	mediaInputPlugin,

	// Processing plugins
	backgroundRemovalPlugin,
	imageResizePlugin,
	formatConversionPlugin,

	// Output plugins
	mediaOutputPlugin,

	// TODO: Add more plugins here as they are created
	// imageResizePlugin,
	// formatConversionPlugin,
	// logoAdditionPlugin,
	// colorCorrectionPlugin,
	// styleTransferPlugin,
	// videoGenerationPlugin,
];

// Plugin categories for organization
export const PLUGIN_CATEGORIES = {
	input: "Input Sources",
	processing: "Media Processing",
	output: "Output Destinations",
	utility: "Utilities",
} as const;

// Initialize all plugins
export async function initializePlugins(): Promise<void> {
	console.log("Initializing media processing plugins...");

	let successCount = 0;
	let errorCount = 0;

	for (const plugin of availablePlugins) {
		try {
			await pluginRegistry.register(plugin);
			successCount++;
		} catch (error) {
			console.error(`Failed to register plugin "${plugin.id}":`, error);
			errorCount++;
		}
	}

	console.log(
		`Plugin initialization complete: ${successCount} successful, ${errorCount} failed`,
	);

	// Log registry stats
	const stats = pluginRegistry.getStats();
	console.log("Plugin registry stats:", stats);
}

// Get plugins by category for UI organization
export function getPluginsByCategory() {
	return {
		input: pluginRegistry.getByCategory("input").map((entry) => entry.plugin),
		processing: pluginRegistry
			.getByCategory("processing")
			.map((entry) => entry.plugin),
		output: pluginRegistry.getByCategory("output").map((entry) => entry.plugin),
		utility: pluginRegistry
			.getByCategory("utility")
			.map((entry) => entry.plugin),
	};
}

// Helper function to get plugin for workflow node
export function getPluginForNode(pluginId: string): MediaPlugin | undefined {
	const entry = pluginRegistry.get(pluginId);
	return entry?.enabled ? entry.plugin : undefined;
}

// Validate if a plugin can process given files
export function canPluginProcessFiles(pluginId: string, files: any[]): boolean {
	const plugin = getPluginForNode(pluginId);
	if (!plugin) return false;

	const validation = plugin.validateInput(files);
	return validation.valid;
}

// Get recommended plugins for given files
export function getRecommendedPlugins(files: any[]): MediaPlugin[] {
	return pluginRegistry.getCompatible(files).map((entry) => entry.plugin);
}

// Plugin execution wrapper with error handling and logging
export async function executePlugin(
	pluginId: string,
	inputFiles: MediaFile[],
	config: PluginConfig,
	context: PluginExecutionContext,
): Promise<MediaProcessingResult> {
	const plugin = getPluginForNode(pluginId);
	if (!plugin) {
		throw new Error(`Plugin "${pluginId}" not found or disabled`);
	}

	// Validate input
	const inputValidation = plugin.validateInput(inputFiles);
	if (!inputValidation.valid) {
		throw new Error(`Invalid input: ${inputValidation.errors.join(", ")}`);
	}

	// Validate config
	const configValidation = plugin.validateConfig(config);
	if (!configValidation.valid) {
		throw new Error(
			`Invalid configuration: ${configValidation.errors.join(", ")}`,
		);
	}

	// Increment usage counter
	pluginRegistry.incrementUsage(pluginId);

	// Execute plugin
	try {
		const result = await plugin.execute(inputFiles, config, context);

		if (result.success) {
			context.onLog?.(`Plugin "${plugin.name}" executed successfully`);
		} else {
			context.onLog?.(
				`Plugin "${plugin.name}" failed: ${result.error}`,
				"error",
			);
		}

		return result;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		context.onLog?.(
			`Plugin "${plugin.name}" threw error: ${errorMessage}`,
			"error",
		);
		throw error;
	}
}

// Export plugin registry for direct access
export { pluginRegistry };

// Export types for external use
export type {
	MediaFile,
	MediaPlugin,
	MediaProcessingResult,
	PluginConfig,
	PluginConfigField,
	PluginExecutionContext,
	ValidationResult,
} from "./types";

// Auto-initialize plugins when module is imported
// This ensures plugins are available as soon as the module loads
let initializationPromise: Promise<void> | null = null;

export function ensurePluginsInitialized(): Promise<void> {
	if (!initializationPromise) {
		initializationPromise = initializePlugins();
	}
	return initializationPromise;
}

// Initialize immediately in browser environment
if (typeof window !== "undefined") {
	ensurePluginsInitialized().catch(console.error);
}
