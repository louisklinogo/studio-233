import type { ComponentType } from "react";

// Base types for media processing
export interface MediaFile {
	id: string;
	url: string;
	name: string;
	type: "image" | "video" | "audio";
	format: string; // jpg, png, mp4, etc.
	size: number;
	width?: number;
	height?: number;
	duration?: number; // for video/audio
	metadata?: Record<string, unknown>;
}

export interface MediaProcessingResult {
	success: boolean;
	outputFiles: MediaFile[];
	error?: string;
	metadata?: Record<string, unknown>;
}

export interface ProcessingProgress {
	progress: number; // 0-100
	status: string;
	currentFile?: string;
	completedFiles: number;
	totalFiles: number;
}

// Plugin configuration types
export interface PluginConfigField {
	key: string;
	label: string;
	type: "text" | "number" | "boolean" | "select" | "file" | "color" | "range";
	description?: string;
	required?: boolean;
	defaultValue?: unknown;
	options?: Array<{ label: string; value: unknown }>; // for select type
	min?: number; // for number/range
	max?: number; // for number/range
	step?: number; // for number/range
	accept?: string; // for file type
	validation?: (value: unknown) => string | null; // return error message or null
}

export interface PluginConfig {
	[key: string]: unknown;
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

// Plugin execution context
export interface PluginExecutionContext {
	workflowId: string;
	stepId: string;
	userId: string;
	projectId: string;
	onProgress?: (progress: ProcessingProgress) => void;
	onLog?: (message: string, level?: "info" | "warn" | "error") => void;
	signal?: AbortSignal; // for cancellation
}

// React component props for plugin UI
export interface PluginConfigComponentProps {
	config: PluginConfig;
	onChange: (config: PluginConfig) => void;
	errors?: Record<string, string>;
}

export interface PluginNodeComponentProps {
	data: {
		label?: string;
		description?: string;
		config?: PluginConfig;
		status?: "idle" | "running" | "success" | "error";
		enabled?: boolean;
	};
	selected?: boolean;
}

// Main plugin interface
export interface MediaPlugin {
	// Plugin metadata
	id: string;
	name: string;
	description: string;
	version: string;
	author?: string;
	category: "input" | "processing" | "output" | "utility";
	tags?: string[];

	// Plugin capabilities
	supportedInputTypes: Array<"image" | "video" | "audio">;
	supportedOutputTypes: Array<"image" | "video" | "audio">;
	supportedFormats: {
		input: string[]; // ["jpg", "png", "mp4", etc.]
		output: string[];
	};

	// Configuration schema
	configFields: PluginConfigField[];
	defaultConfig: PluginConfig;

	// UI Components
	configComponent: ComponentType<PluginConfigComponentProps>;
	nodeComponent: ComponentType<PluginNodeComponentProps>;

	// Plugin icon (optional)
	icon?: string; // Icon name or SVG
	iconComponent?: ComponentType<{ className?: string }>;

	// Validation functions
	validateInput: (files: MediaFile[]) => ValidationResult;
	validateConfig: (config: PluginConfig) => ValidationResult;

	// Execution function
	execute: (
		input: MediaFile[],
		config: PluginConfig,
		context: PluginExecutionContext,
	) => Promise<MediaProcessingResult>;

	// Optional lifecycle hooks
	onInstall?: () => Promise<void>;
	onUninstall?: () => Promise<void>;
	onEnable?: () => Promise<void>;
	onDisable?: () => Promise<void>;

	// Cost estimation (optional)
	estimateCost?: (files: MediaFile[], config: PluginConfig) => Promise<number>;

	// Preview generation (optional)
	generatePreview?: (
		files: MediaFile[],
		config: PluginConfig,
	) => Promise<MediaFile[]>;
}

// Plugin registry types
export interface PluginRegistryEntry {
	plugin: MediaPlugin;
	enabled: boolean;
	installedAt: Date;
	lastUsed?: Date;
	usageCount: number;
}

export interface PluginRegistry {
	plugins: Map<string, PluginRegistryEntry>;

	// Registry operations
	register(plugin: MediaPlugin): Promise<void>;
	unregister(pluginId: string): Promise<void>;
	enable(pluginId: string): Promise<void>;
	disable(pluginId: string): Promise<void>;

	// Plugin access
	get(pluginId: string): PluginRegistryEntry | undefined;
	getAll(): PluginRegistryEntry[];
	getByCategory(category: MediaPlugin["category"]): PluginRegistryEntry[];
	getEnabled(): PluginRegistryEntry[];

	// Plugin discovery
	search(query: string): PluginRegistryEntry[];
	getCompatible(inputFiles: MediaFile[]): PluginRegistryEntry[];
}

// Workflow node data that includes plugin information
export interface MediaWorkflowNodeData {
	label?: string;
	description?: string;
	status?: "idle" | "running" | "success" | "error";
	enabled?: boolean;

	// Plugin-specific data
	pluginId?: string;
	config?: PluginConfig;

	// Execution results
	lastResult?: MediaProcessingResult;
	lastExecuted?: Date;
	executionTime?: number; // milliseconds

	// UI state
	expanded?: boolean;
	showPreview?: boolean;
}
