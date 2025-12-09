import { Eraser } from "lucide-react";
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

// Configuration component for background removal
function BackgroundRemovalConfig({
	config,
	onChange,
	errors,
}: PluginConfigComponentProps): React.JSX.Element {
	const currentConfig = {
		model: "bria", // Default model
		quality: "high",
		...config,
	};

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium mb-2">AI Model</label>
				<select
					value={currentConfig.model as string}
					onChange={(e) =>
						onChange({ ...currentConfig, model: e.target.value })
					}
					className="w-full border rounded px-3 py-2"
				>
					<option value="bria">BRIA (Fast, Good Quality)</option>
					<option value="gemini">Gemini (Slower, High Quality)</option>
				</select>
				{errors?.model && (
					<p className="text-red-500 text-xs mt-1">{errors.model}</p>
				)}
			</div>

			<div>
				<label className="block text-sm font-medium mb-2">Quality</label>
				<select
					value={currentConfig.quality as string}
					onChange={(e) =>
						onChange({ ...currentConfig, quality: e.target.value })
					}
					className="w-full border rounded px-3 py-2"
				>
					<option value="fast">Fast</option>
					<option value="balanced">Balanced</option>
					<option value="high">High Quality</option>
				</select>
				{errors?.quality && (
					<p className="text-red-500 text-xs mt-1">{errors.quality}</p>
				)}
			</div>

			<div className="text-xs text-muted-foreground">
				<p>• BRIA model is faster and works well for most images</p>
				<p>• Gemini model provides higher quality but takes longer</p>
				<p>• Higher quality settings may increase processing time</p>
			</div>
		</div>
	);
}

// Node component for background removal
function BackgroundRemovalNode({
	data,
	selected,
}: PluginNodeComponentProps): React.JSX.Element {
	const config = data.config || {};
	const model = config.model || "bria";
	const quality = config.quality || "high";

	return (
		<div
			className={`p-4 border-2 rounded-lg bg-white ${
				selected ? "border-blue-500" : "border-gray-200"
			} ${data.status === "running" ? "animate-pulse" : ""}`}
		>
			<div className="flex items-center gap-2 mb-2">
				<Eraser className="w-5 h-5 text-blue-600" />
				<h3 className="font-medium">{data.label || "Remove Background"}</h3>
			</div>

			<p className="text-sm text-gray-600 mb-3">
				{data.description || "AI-powered background removal"}
			</p>

			<div className="text-xs space-y-1">
				<div className="flex justify-between">
					<span className="text-gray-500">Model:</span>
					<span className="font-medium">{String(model)}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-gray-500">Quality:</span>
					<span className="font-medium">{String(quality)}</span>
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
						? "Processing..."
						: data.status === "success"
							? "Complete"
							: data.status === "error"
								? "Error"
								: "Ready"}
				</div>
			)}
		</div>
	);
}

// Main plugin implementation
export const backgroundRemovalPlugin: MediaPlugin = {
	// Metadata
	id: "background-removal",
	name: "Remove Background",
	description: "AI-powered background removal using BRIA or Gemini models",
	version: "1.0.0",
	author: "Studio+233",
	category: "processing",
	tags: ["ai", "background", "removal", "segmentation"],

	// Capabilities
	supportedInputTypes: ["image"],
	supportedOutputTypes: ["image"],
	supportedFormats: {
		input: ["jpg", "jpeg", "png", "webp"],
		output: ["png"], // Always output PNG for transparency
	},

	// Configuration
	configFields: [
		{
			key: "model",
			label: "AI Model",
			type: "select",
			description: "Choose the AI model for background removal",
			required: true,
			defaultValue: "bria",
			options: [
				{ label: "BRIA (Fast, Good Quality)", value: "bria" },
				{ label: "Gemini (Slower, High Quality)", value: "gemini" },
			],
		},
		{
			key: "quality",
			label: "Quality",
			type: "select",
			description: "Processing quality vs speed trade-off",
			required: true,
			defaultValue: "high",
			options: [
				{ label: "Fast", value: "fast" },
				{ label: "Balanced", value: "balanced" },
				{ label: "High Quality", value: "high" },
			],
		},
	],
	defaultConfig: {
		model: "bria",
		quality: "high",
	},

	// UI Components
	configComponent: BackgroundRemovalConfig,
	nodeComponent: BackgroundRemovalNode,
	icon: "eraser",

	// Validation
	validateInput: (files: MediaFile[]): ValidationResult => {
		const errors: string[] = [];

		if (files.length === 0) {
			errors.push("At least one image file is required");
		}

		for (const file of files) {
			if (file.type !== "image") {
				errors.push(`File "${file.name}" is not an image`);
			}

			if (!["jpg", "jpeg", "png", "webp"].includes(file.format.toLowerCase())) {
				errors.push(
					`File "${file.name}" format "${file.format}" is not supported`,
				);
			}
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},

	validateConfig: (config): ValidationResult => {
		const errors: string[] = [];

		if (!config.model || !["bria", "gemini"].includes(config.model as string)) {
			errors.push("Invalid model selection");
		}

		if (
			!config.quality ||
			!["fast", "balanced", "high"].includes(config.quality as string)
		) {
			errors.push("Invalid quality selection");
		}

		return {
			valid: errors.length === 0,
			errors,
		};
	},

	// Execution
	execute: async (
		inputFiles: MediaFile[],
		config,
		context: PluginExecutionContext,
	): Promise<MediaProcessingResult> => {
		// Cast to extended context to access TRPC helpers
		const extendedContext = context as ExtendedPluginExecutionContext;

		try {
			extendedContext.updateProgress(
				0,
				"Starting background removal...",
				inputFiles[0]?.name,
			);
			extendedContext.logInfo(
				`Starting background removal for ${inputFiles.length} files using ${config.model} model`,
			);

			const outputFiles: MediaFile[] = [];
			const startTime = Date.now();

			for (let i = 0; i < inputFiles.length; i++) {
				const file = inputFiles[i];

				// Check for cancellation
				extendedContext.checkCancellation();

				const progress = (i / inputFiles.length) * 90; // Reserve 10% for final processing
				extendedContext.updateProgress(
					progress,
					`Processing ${file.name}...`,
					file.name,
				);
				extendedContext.logInfo(
					`Processing file ${i + 1}/${inputFiles.length}: ${file.name}`,
				);

				try {
					// Use the real TRPC removeBackground endpoint
					const result = await extendedContext.removeBackground(file.url);

					// Router currently returns `{ url: string }`; keep fallback to `imageUrl` for future-proofing
					const processedUrl =
						(result as any)?.imageUrl ?? (result as any)?.url;
					if (!processedUrl) {
						throw new Error("No processed image URL returned from API");
					}

					// Create output file with real processed data
					const outputFile: MediaFile = {
						id: `${file.id}_no_bg`,
						url: processedUrl,
						name: file.name.replace(/\.[^.]+$/, "_no_bg.png"),
						type: "image",
						format: "png",
						size: file.size, // We don't know the exact size until we fetch it
						width: file.width,
						height: file.height,
						metadata: {
							...file.metadata,
							processedBy: "background-removal",
							originalFile: file.id,
							model: config.model,
							quality: config.quality,
							processedAt: new Date().toISOString(),
							apiResult: result,
						},
					};

					outputFiles.push(outputFile);
					extendedContext.logInfo(
						`Successfully processed ${file.name} -> ${result.imageUrl}`,
					);
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Unknown error";
					extendedContext.logError(
						`Failed to process ${file.name}: ${errorMessage}`,
					);

					// For now, continue with other files instead of failing completely
					// In production, you might want to make this configurable
					continue;
				}
			}

			if (outputFiles.length === 0) {
				throw new Error("No files were successfully processed");
			}

			const processingTime = Date.now() - startTime;
			extendedContext.updateProgress(100, "Background removal complete");
			extendedContext.logInfo(
				`Background removal completed: ${outputFiles.length}/${inputFiles.length} files processed in ${processingTime}ms`,
			);

			return {
				success: true,
				outputFiles,
				metadata: {
					processedFiles: outputFiles.length,
					totalFiles: inputFiles.length,
					model: config.model,
					quality: config.quality,
					processingTime,
					successRate: (outputFiles.length / inputFiles.length) * 100,
				},
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Background removal failed";
			extendedContext.logError(`Background removal failed: ${errorMessage}`);

			return {
				success: false,
				outputFiles: [],
				error: errorMessage,
			};
		}
	},

	// Cost estimation (optional)
	estimateCost: async (files: MediaFile[]): Promise<number> => {
		// Estimate cost based on file count and size
		// This is a simplified example
		const baseRate = 0.01; // $0.01 per image
		return files.length * baseRate;
	},
};
