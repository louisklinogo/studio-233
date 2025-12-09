import { Download } from "lucide-react";
import React from "react";
import type {
	MediaFile,
	MediaPlugin,
	MediaProcessingResult,
	PluginConfigComponentProps,
	PluginExecutionContext,
	PluginNodeComponentProps,
	ValidationResult,
} from "./types";

// Configuration component for media output
function MediaOutputConfig({
	config,
	onChange,
	errors,
}: PluginConfigComponentProps): React.JSX.Element {
	const currentConfig = {
		destination: "download",
		format: "original",
		quality: 90,
		...config,
	};

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium mb-2">
					Output Destination
				</label>
				<select
					value={currentConfig.destination as string}
					onChange={(e) =>
						onChange({ ...currentConfig, destination: e.target.value })
					}
					className="w-full border rounded px-3 py-2"
				>
					<option value="download">Download ZIP</option>
					<option value="library">Save to Asset Library</option>
					<option value="canvas">Import to Canvas</option>
					<option value="cloud">Cloud Storage</option>
				</select>
				{errors?.destination ? (
					<p className="text-red-500 text-xs mt-1">{errors.destination}</p>
				) : null}
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">Output Format</label>
				<select
					value={currentConfig.format as string}
					onChange={(e) =>
						onChange({ ...currentConfig, format: e.target.value })
					}
					className="w-full border rounded px-3 py-2"
				>
					<option value="original">Keep Original</option>
					<option value="png">PNG</option>
					<option value="jpg">JPEG</option>
					<option value="webp">WebP</option>
				</select>
				{errors?.format ? (
					<p className="text-red-500 text-xs mt-1">{errors.format}</p>
				) : null}
			</div>

			{currentConfig.format === "jpg" ? (
				<div>
					<label className="block text-sm font-medium mb-2">
						Quality ({currentConfig.quality}%)
					</label>
					<input
						type="range"
						min="10"
						max="100"
						step="5"
						value={currentConfig.quality as number}
						onChange={(e) =>
							onChange({
								...currentConfig,
								quality: parseInt(e.target.value, 10),
							})
						}
						className="w-full"
					/>
					{errors?.quality ? (
						<p className="text-red-500 text-xs mt-1">{errors.quality}</p>
					) : null}
				</div>
			) : null}

			<div className="text-xs text-muted-foreground">
				<p>• Download: Create ZIP archive for download</p>
				<p>• Library: Save results to your asset library</p>
				<p>• Canvas: Import results back to Canvas projects</p>
				<p>• Cloud: Upload to connected cloud storage</p>
			</div>
		</div>
	);
}

// Node component for media output
function MediaOutputNode({
	data,
	selected,
}: PluginNodeComponentProps): React.JSX.Element {
	const config = data.config || {};
	const destination =
		typeof (config as any).destination === "string"
			? (config as any).destination
			: "download";
	const format =
		typeof (config as any).format === "string"
			? (config as any).format
			: "original";

	return (
		<div
			className={`p-4 border-2 rounded-lg bg-white ${
				selected ? "border-purple-500" : "border-gray-200"
			} ${data.status === "running" ? "animate-pulse" : ""}`}
		>
			<div className="flex items-center gap-2 mb-2">
				<Download className="w-5 h-5 text-purple-600" />
				<h3 className="font-medium">{data.label || "Media Output"}</h3>
			</div>

			<p className="text-sm text-gray-600 mb-3">
				{data.description || "Save or export processed media"}
			</p>

			<div className="text-xs space-y-1">
				<div className="flex justify-between">
					<span className="text-gray-500">Destination:</span>
					<span className="font-medium capitalize">{destination}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-gray-500">Format:</span>
					<span className="font-medium uppercase">{format}</span>
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
						? "Saving..."
						: data.status === "success"
							? "Saved"
							: data.status === "error"
								? "Save failed"
								: "Ready"}
				</div>
			)}
		</div>
	);
}

// Main plugin implementation
export const mediaOutputPlugin: MediaPlugin = {
	// Metadata
	id: "media-output",
	name: "Media Output",
	description: "Output destination for processed media files",
	version: "1.0.0",
	author: "Studio+233",
	category: "output",
	tags: ["output", "download", "save", "export"],

	// Capabilities
	supportedInputTypes: ["image", "video", "audio"],
	supportedOutputTypes: [], // Output plugins don't have output types
	supportedFormats: {
		input: [
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
		output: [],
	},

	// Configuration
	configFields: [
		{
			key: "destination",
			label: "Output Destination",
			type: "select",
			description: "Where to save the processed files",
			required: true,
			defaultValue: "download",
			options: [
				{ label: "Download ZIP", value: "download" },
				{ label: "Asset Library", value: "library" },
				{ label: "Canvas Import", value: "canvas" },
				{ label: "Cloud Storage", value: "cloud" },
			],
		},
		{
			key: "format",
			label: "Output Format",
			type: "select",
			description: "File format for output",
			required: true,
			defaultValue: "original",
			options: [
				{ label: "Keep Original", value: "original" },
				{ label: "PNG", value: "png" },
				{ label: "JPEG", value: "jpg" },
				{ label: "WebP", value: "webp" },
			],
		},
		{
			key: "quality",
			label: "Quality (%)",
			type: "range",
			description: "Output quality for JPEG format",
			required: false,
			defaultValue: 90,
			min: 10,
			max: 100,
			step: 5,
		},
	],
	defaultConfig: {
		destination: "download",
		format: "original",
		quality: 90,
	},

	// UI Components
	configComponent: MediaOutputConfig,
	nodeComponent: MediaOutputNode,
	icon: "download",

	// Validation
	validateInput: (files: MediaFile[]): ValidationResult => {
		const errors: string[] = [];

		if (files.length === 0) {
			errors.push("At least one file is required for output");
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},

	validateConfig: (config): ValidationResult => {
		const errors: string[] = [];

		if (
			!config.destination ||
			!["download", "library", "canvas", "cloud"].includes(
				config.destination as string,
			)
		) {
			errors.push("Invalid output destination");
		}

		if (
			!config.format ||
			!["original", "png", "jpg", "webp"].includes(config.format as string)
		) {
			errors.push("Invalid output format");
		}

		if (config.format === "jpg") {
			const quality = config.quality as number;
			if (!quality || quality < 10 || quality > 100) {
				errors.push("Quality must be between 10 and 100");
			}
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},

	// Execution - Output plugin collects results and prepares for download
	execute: async (
		inputFiles: MediaFile[],
		config,
		context: PluginExecutionContext,
	): Promise<MediaProcessingResult> => {
		try {
			if (inputFiles.length === 0) {
				context.onLog?.("No files to output", "warn");
				return {
					success: true,
					outputFiles: [],
					metadata: { message: "No files to output" },
				};
			}

			context.onProgress?.({
				progress: 0,
				status: "Preparing output...",
				currentFile: undefined,
				completedFiles: 0,
				totalFiles: inputFiles.length,
			});

			context.onLog?.(
				`Output plugin received ${inputFiles.length} files for ${config.destination}`,
			);

			// Process each file (format conversion if needed)
			const outputFiles: MediaFile[] = [];
			const targetFormat = config.format as string;

			for (let i = 0; i < inputFiles.length; i++) {
				const file = inputFiles[i];

				context.onProgress?.({
					progress: ((i + 1) / inputFiles.length) * 90,
					status: `Preparing ${file.name}...`,
					currentFile: file.name,
					completedFiles: i,
					totalFiles: inputFiles.length,
				});

				// If format conversion is needed and not "original", we'd do it here
				// For now, just pass through with updated metadata
				const outputFile: MediaFile = {
					...file,
					metadata: {
						...file.metadata,
						outputDestination: config.destination,
						outputFormat:
							targetFormat === "original" ? file.format : targetFormat,
						preparedAt: new Date().toISOString(),
					},
				};

				outputFiles.push(outputFile);
				context.onLog?.(`Prepared ${file.name} for ${config.destination}`);
			}

			context.onProgress?.({
				progress: 100,
				status: `${outputFiles.length} files ready for download`,
				currentFile: undefined,
				completedFiles: inputFiles.length,
				totalFiles: inputFiles.length,
			});

			context.onLog?.(`Output complete: ${outputFiles.length} files ready`);

			return {
				success: true,
				outputFiles, // These files will be available in the results panel
				metadata: {
					destination: config.destination,
					format: config.format,
					filesProcessed: outputFiles.length,
					completedAt: new Date().toISOString(),
				},
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to prepare output";
			context.onLog?.(errorMessage, "error");

			return {
				success: false,
				outputFiles: [],
				error: errorMessage,
			};
		}
	},
};
