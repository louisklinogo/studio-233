import { Upload } from "lucide-react";
import React from "react";
import type { ExtendedPluginExecutionContext } from "../execution-context";
import type {
	MediaFile,
	MediaPlugin,
	MediaProcessingResult,
	PluginConfigComponentProps,
	PluginExecutionContext,
	PluginNodeComponentProps,
	ValidationResult,
} from "./types";

// Configuration component for media input
function MediaInputConfig({
	config,
	onChange,
	errors,
}: PluginConfigComponentProps): React.JSX.Element {
	const currentConfig = {
		source: "upload", // Default source
		maxFiles: 10,
		maxSizePerFile: 50, // MB
		...config,
	};

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium mb-2">Input Source</label>
				<select
					value={currentConfig.source as string}
					onChange={(e) =>
						onChange({ ...currentConfig, source: e.target.value })
					}
					className="w-full border rounded px-3 py-2"
				>
					<option value="upload">File Upload</option>
					<option value="library">Asset Library</option>
					<option value="canvas">Canvas Export</option>
					<option value="url">URL Import</option>
				</select>
				{errors?.source && (
					<p className="text-red-500 text-xs mt-1">{errors.source}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">Max Files</label>
				<input
					type="number"
					min="1"
					max="100"
					value={currentConfig.maxFiles as number}
					onChange={(e) =>
						onChange({ ...currentConfig, maxFiles: parseInt(e.target.value) })
					}
					className="w-full border rounded px-3 py-2"
				/>
				{errors?.maxFiles && (
					<p className="text-red-500 text-xs mt-1">{errors.maxFiles}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">
					Max Size Per File (MB)
				</label>
				<input
					type="number"
					min="1"
					max="500"
					value={currentConfig.maxSizePerFile as number}
					onChange={(e) =>
						onChange({
							...currentConfig,
							maxSizePerFile: parseInt(e.target.value),
						})
					}
					className="w-full border rounded px-3 py-2"
				/>
				{errors?.maxSizePerFile && (
					<p className="text-red-500 text-xs mt-1">{errors.maxSizePerFile}</p>
				)}
			</div>

			<div className="text-xs text-muted-foreground">
				<p>• Upload: Select files from your device</p>
				<p>• Library: Choose from previously uploaded assets</p>
				<p>• Canvas: Export elements from Canvas projects</p>
				<p>• URL: Import files from web URLs</p>
			</div>
		</div>
	);
}

// Node component for media input
function MediaInputNode({
	data,
	selected,
}: PluginNodeComponentProps): React.JSX.Element {
	const config = data.config || {};
	const source = config.source || "upload";
	const maxFiles = config.maxFiles || 10;

	return (
		<div
			className={`p-4 border-2 rounded-lg bg-white ${
				selected ? "border-green-500" : "border-gray-200"
			} ${data.status === "running" ? "animate-pulse" : ""}`}
		>
			<div className="flex items-center gap-2 mb-2">
				<Upload className="w-5 h-5 text-green-600" />
				<h3 className="font-medium">{data.label || "Media Input"}</h3>
			</div>

			<p className="text-sm text-gray-600 mb-3">
				{data.description || "Select media files for processing"}
			</p>

			<div className="text-xs space-y-1">
				<div className="flex justify-between">
					<span className="text-gray-500">Source:</span>
					<span className="font-medium capitalize">{String(source)}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-gray-500">Max Files:</span>
					<span className="font-medium">{String(maxFiles)}</span>
				</div>
			</div>

			{data.status && (
				<div
					className={`mt-2 px-2 py-1 rounded text-xs ${
						data.status === "success"
							? "bg-green-100 text-green-800"
							: data.status === "error"
								? "bg-red-100 text-red-800"
								: data.status === "running"
									? "bg-blue-100 text-blue-800"
									: "bg-gray-100 text-gray-800"
					}`}
				>
					{data.status === "running"
						? "Loading files..."
						: data.status === "success"
							? "Files loaded"
							: data.status === "error"
								? "Error loading"
								: "Ready"}
				</div>
			)}
		</div>
	);
}

// Main plugin implementation
export const mediaInputPlugin: MediaPlugin = {
	// Metadata
	id: "media-input",
	name: "Media Input",
	description: "Input source for media files from various sources",
	version: "1.0.0",
	author: "Studio+233",
	category: "input",
	tags: ["input", "upload", "files", "source"],

	// Capabilities
	supportedInputTypes: [], // Input plugins don't have input types
	supportedOutputTypes: ["image", "video", "audio"],
	supportedFormats: {
		input: [],
		output: [
			"jpg",
			"jpeg",
			"png",
			"webp",
			"gif",
			"mp4",
			"mov",
			"avi",
			"mp3",
			"wav",
		],
	},

	// Configuration
	configFields: [
		{
			key: "source",
			label: "Input Source",
			type: "select",
			description: "Where to get the media files from",
			required: true,
			defaultValue: "upload",
			options: [
				{ label: "File Upload", value: "upload" },
				{ label: "Asset Library", value: "library" },
				{ label: "Canvas Export", value: "canvas" },
				{ label: "URL Import", value: "url" },
			],
		},
		{
			key: "maxFiles",
			label: "Maximum Files",
			type: "number",
			description: "Maximum number of files to process",
			required: true,
			defaultValue: 10,
			min: 1,
			max: 100,
		},
		{
			key: "maxSizePerFile",
			label: "Max Size Per File (MB)",
			type: "number",
			description: "Maximum file size in megabytes",
			required: true,
			defaultValue: 50,
			min: 1,
			max: 500,
		},
	],
	defaultConfig: {
		source: "upload",
		maxFiles: 10,
		maxSizePerFile: 50,
	},

	// UI Components
	configComponent: MediaInputConfig,
	nodeComponent: MediaInputNode,
	icon: "upload",

	// Validation
	validateInput: (): ValidationResult => {
		// Input plugins don't validate input files since they generate them
		return { valid: true, errors: [] };
	},

	validateConfig: (config): ValidationResult => {
		const errors: string[] = [];

		if (
			!config.source ||
			!["upload", "library", "canvas", "url"].includes(config.source as string)
		) {
			errors.push("Invalid input source");
		}

		const maxFiles = config.maxFiles as number;
		if (!maxFiles || maxFiles < 1 || maxFiles > 100) {
			errors.push("Max files must be between 1 and 100");
		}

		const maxSize = config.maxSizePerFile as number;
		if (!maxSize || maxSize < 1 || maxSize > 500) {
			errors.push("Max file size must be between 1 and 500 MB");
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},

	// Execution - Input plugin passes through files from the execution context
	execute: async (
		inputFiles: MediaFile[], // Files come from execution engine's initial input
		config,
		context: PluginExecutionContext,
	): Promise<MediaProcessingResult> => {
		try {
			context.onProgress?.({
				progress: 0,
				status: "Loading media files...",
				currentFile: undefined,
				completedFiles: 0,
				totalFiles: inputFiles.length || 1,
			});

			context.onLog?.(`Input plugin received ${inputFiles.length} files`);

			// Validate and filter files based on config
			const maxFiles = (config.maxFiles as number) || 10;
			const maxSizePerFile =
				((config.maxSizePerFile as number) || 50) * 1024 * 1024; // MB to bytes

			const validFiles = inputFiles.filter((file, index) => {
				if (index >= maxFiles) {
					context.onLog?.(
						`Skipping ${file.name}: exceeds max files limit`,
						"warn",
					);
					return false;
				}
				if (file.size > maxSizePerFile) {
					context.onLog?.(
						`Skipping ${file.name}: exceeds max size limit`,
						"warn",
					);
					return false;
				}
				return true;
			});

			context.onProgress?.({
				progress: 100,
				status: `${validFiles.length} files ready for processing`,
				currentFile: undefined,
				completedFiles: validFiles.length,
				totalFiles: validFiles.length,
			});

			context.onLog?.(
				`Input plugin passing ${validFiles.length} files to next node`,
			);

			return {
				success: true,
				outputFiles: validFiles, // Pass files through to next node
				metadata: {
					source: config.source,
					filesLoaded: validFiles.length,
					filesSkipped: inputFiles.length - validFiles.length,
				},
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to load media files";
			context.onLog?.(errorMessage, "error");

			return {
				success: false,
				outputFiles: [],
				error: errorMessage,
			};
		}
	},
};
