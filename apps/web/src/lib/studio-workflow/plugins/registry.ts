import type {
	MediaFile,
	MediaPlugin,
	PluginRegistry,
	PluginRegistryEntry,
} from "./types";

class MediaPluginRegistry implements PluginRegistry {
	public plugins = new Map<string, PluginRegistryEntry>();

	async register(plugin: MediaPlugin): Promise<void> {
		// Validate plugin
		if (!plugin.id || !plugin.name || !plugin.execute) {
			throw new Error("Invalid plugin: missing required fields");
		}

		// Check for duplicate IDs
		if (this.plugins.has(plugin.id)) {
			throw new Error(`Plugin with ID "${plugin.id}" is already registered`);
		}

		// Run install hook if present
		if (plugin.onInstall) {
			await plugin.onInstall();
		}

		// Register the plugin
		const entry: PluginRegistryEntry = {
			plugin,
			enabled: true,
			installedAt: new Date(),
			usageCount: 0,
		};

		this.plugins.set(plugin.id, entry);

		// Run enable hook if present
		if (plugin.onEnable) {
			await plugin.onEnable();
		}

		console.log(
			`Plugin "${plugin.name}" (${plugin.id}) registered successfully`,
		);
	}

	async unregister(pluginId: string): Promise<void> {
		const entry = this.plugins.get(pluginId);
		if (!entry) {
			throw new Error(`Plugin "${pluginId}" not found`);
		}

		// Run disable hook if enabled
		if (entry.enabled && entry.plugin.onDisable) {
			await entry.plugin.onDisable();
		}

		// Run uninstall hook if present
		if (entry.plugin.onUninstall) {
			await entry.plugin.onUninstall();
		}

		// Remove from registry
		this.plugins.delete(pluginId);

		console.log(`Plugin "${entry.plugin.name}" (${pluginId}) unregistered`);
	}

	async enable(pluginId: string): Promise<void> {
		const entry = this.plugins.get(pluginId);
		if (!entry) {
			throw new Error(`Plugin "${pluginId}" not found`);
		}

		if (entry.enabled) {
			return; // Already enabled
		}

		// Run enable hook if present
		if (entry.plugin.onEnable) {
			await entry.plugin.onEnable();
		}

		entry.enabled = true;
		console.log(`Plugin "${entry.plugin.name}" (${pluginId}) enabled`);
	}

	async disable(pluginId: string): Promise<void> {
		const entry = this.plugins.get(pluginId);
		if (!entry) {
			throw new Error(`Plugin "${pluginId}" not found`);
		}

		if (!entry.enabled) {
			return; // Already disabled
		}

		// Run disable hook if present
		if (entry.plugin.onDisable) {
			await entry.plugin.onDisable();
		}

		entry.enabled = false;
		console.log(`Plugin "${entry.plugin.name}" (${pluginId}) disabled`);
	}

	get(pluginId: string): PluginRegistryEntry | undefined {
		return this.plugins.get(pluginId);
	}

	getAll(): PluginRegistryEntry[] {
		return Array.from(this.plugins.values());
	}

	getByCategory(category: MediaPlugin["category"]): PluginRegistryEntry[] {
		return this.getAll().filter((entry) => entry.plugin.category === category);
	}

	getEnabled(): PluginRegistryEntry[] {
		return this.getAll().filter((entry) => entry.enabled);
	}

	search(query: string): PluginRegistryEntry[] {
		const lowerQuery = query.toLowerCase();
		return this.getAll().filter((entry) => {
			const plugin = entry.plugin;
			return (
				plugin.name.toLowerCase().includes(lowerQuery) ||
				plugin.description.toLowerCase().includes(lowerQuery) ||
				plugin.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
				plugin.id.toLowerCase().includes(lowerQuery)
			);
		});
	}

	getCompatible(inputFiles: MediaFile[]): PluginRegistryEntry[] {
		if (inputFiles.length === 0) {
			return this.getEnabled();
		}

		return this.getEnabled().filter((entry) => {
			const plugin = entry.plugin;

			// Check if plugin supports the input file types
			const inputTypes = [...new Set(inputFiles.map((file) => file.type))];
			const supportsAllTypes = inputTypes.every((type) =>
				plugin.supportedInputTypes.includes(type),
			);

			if (!supportsAllTypes) {
				return false;
			}

			// Check if plugin supports the input file formats
			const inputFormats = [...new Set(inputFiles.map((file) => file.format))];
			const supportsAllFormats = inputFormats.every((format) =>
				plugin.supportedFormats.input.includes(format),
			);

			return supportsAllFormats;
		});
	}

	// Utility methods
	incrementUsage(pluginId: string): void {
		const entry = this.plugins.get(pluginId);
		if (entry) {
			entry.usageCount++;
			entry.lastUsed = new Date();
		}
	}

	getStats() {
		const all = this.getAll();
		const enabled = this.getEnabled();

		return {
			total: all.length,
			enabled: enabled.length,
			disabled: all.length - enabled.length,
			byCategory: {
				input: this.getByCategory("input").length,
				processing: this.getByCategory("processing").length,
				output: this.getByCategory("output").length,
				utility: this.getByCategory("utility").length,
			},
			mostUsed: all
				.sort((a, b) => b.usageCount - a.usageCount)
				.slice(0, 5)
				.map((entry) => ({
					id: entry.plugin.id,
					name: entry.plugin.name,
					usageCount: entry.usageCount,
				})),
		};
	}
}

// Global plugin registry instance
export const pluginRegistry = new MediaPluginRegistry();

// Helper functions for common operations
export async function registerPlugin(plugin: MediaPlugin): Promise<void> {
	return pluginRegistry.register(plugin);
}

export function getPlugin(pluginId: string): MediaPlugin | undefined {
	return pluginRegistry.get(pluginId)?.plugin;
}

export function getEnabledPlugins(): MediaPlugin[] {
	return pluginRegistry.getEnabled().map((entry) => entry.plugin);
}

export function getPluginsByCategory(
	category: MediaPlugin["category"],
): MediaPlugin[] {
	return pluginRegistry.getByCategory(category).map((entry) => entry.plugin);
}

export function searchPlugins(query: string): MediaPlugin[] {
	return pluginRegistry.search(query).map((entry) => entry.plugin);
}

export function getCompatiblePlugins(inputFiles: MediaFile[]): MediaPlugin[] {
	return pluginRegistry.getCompatible(inputFiles).map((entry) => entry.plugin);
}
