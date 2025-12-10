import { Layers } from "lucide-react";
import React, { useMemo, useState } from "react";
import type { ExtendedPluginExecutionContext } from "../execution-context";
import {
	blobFromCanvas,
	canvasFromImage,
	loadImage,
	toQuality,
} from "./image-utils";
import type {
	MediaFile,
	MediaPlugin,
	MediaProcessingResult,
	PluginConfig,
	PluginConfigComponentProps,
	PluginExecutionContext,
	PluginNodeComponentProps,
	ValidationResult,
} from "./types";

type ConversionConfig = {
	targetFormat: "png" | "jpeg" | "webp";
	quality?: number;
	background?: string;
};

function FormatConversionConfig({
	config,
	onChange,
	errors,
}: PluginConfigComponentProps): React.JSX.Element {
	const [local, setLocal] = useState<ConversionConfig>({
		targetFormat: "png",
		quality: 90,
		background: "#ffffff",
		...config,
	});

	const update = (next: Partial<ConversionConfig>) => {
		const merged = { ...local, ...next };
		setLocal(merged);
		onChange(merged as PluginConfig);
	};

	return (
		<div className="space-y-4 text-sm">
			<label className="space-y-1 block">
				<span className="text-xs text-neutral-500">Target format</span>
				<select
					value={local.targetFormat}
					onChange={(e) =>
						update({
							targetFormat: e.target.value as ConversionConfig["targetFormat"],
						})
					}
					className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1"
				>
					<option value="png">PNG (lossless)</option>
					<option value="jpeg">JPEG (small, no alpha)</option>
					<option value="webp">WebP (balanced)</option>
				</select>
			</label>

			<label className="space-y-1 block">
				<span className="text-xs text-neutral-500">Quality (1-100)</span>
				<input
					type="number"
					min={1}
					max={100}
					value={local.quality ?? 90}
					onChange={(e) =>
						update({ quality: e.target.value ? Number(e.target.value) : 90 })
					}
					className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1"
				/>
				{errors?.quality && (
					<p className="text-[11px] text-red-500">{errors.quality}</p>
				)}
			</label>

			{local.targetFormat === "jpeg" && (
				<label className="space-y-1 block">
					<span className="text-xs text-neutral-500">
						Background (for alpha)
					</span>
					<input
						type="color"
						value={local.background ?? "#ffffff"}
						onChange={(e) => update({ background: e.target.value })}
						className="h-9 w-full cursor-pointer rounded border border-neutral-200"
					/>
				</label>
			)}
		</div>
	);
}

function FormatConversionNode({ data, selected }: PluginNodeComponentProps) {
	const config = data.config as ConversionConfig | undefined;
	return (
		<div
			className={`p-4 border-2 rounded-lg bg-white ${
				selected ? "border-neutral-900" : "border-neutral-200"
			}`}
		>
			<div className="flex items-center gap-2 mb-2">
				<Layers className="w-5 h-5 text-neutral-900" />
				<h3 className="font-semibold">{data.label || "Convert Format"}</h3>
			</div>
			<p className="text-xs text-neutral-500 mb-2">
				{data.description || "Convert images between PNG/JPEG/WebP."}
			</p>
			<div className="text-[11px] space-y-1 text-neutral-700">
				<p>Format: {config?.targetFormat ?? "png"}</p>
				<p>Quality: {config?.quality ?? 90}</p>
				{config?.targetFormat === "jpeg" && (
					<p>Background: {config.background ?? "#ffffff"}</p>
				)}
			</div>
		</div>
	);
}

async function convertImage(
	file: MediaFile,
	config: ConversionConfig,
): Promise<MediaFile> {
	const image = await loadImage(file.url);
	const canvas = await canvasFromImage(image, {
		width: image.naturalWidth,
		height: image.naturalHeight,
	});
	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Canvas context unavailable");
	}

	if (config.targetFormat === "jpeg" && context) {
		context.globalCompositeOperation = "destination-over";
		context.fillStyle = config.background ?? "#ffffff";
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	const mimeMap: Record<ConversionConfig["targetFormat"], string> = {
		png: "image/png",
		jpeg: "image/jpeg",
		webp: "image/webp",
	};
	const blob = await blobFromCanvas(
		canvas,
		mimeMap[config.targetFormat],
		toQuality(config.quality, 0.9),
	);
	const url = URL.createObjectURL(blob);
	const format = config.targetFormat;

	return {
		id: `${file.id}_${format}`,
		url,
		name: file.name.replace(/\.[^.]+$/, `.${format}`),
		type: "image",
		format,
		size: blob.size,
		width: image.naturalWidth,
		height: image.naturalHeight,
		metadata: {
			...file.metadata,
			processedBy: "format-conversion",
			targetFormat: format,
		},
	};
}

export const formatConversionPlugin: MediaPlugin = {
	id: "format-conversion",
	name: "Convert Format",
	description: "Convert images between PNG, JPEG, and WebP.",
	version: "1.0.0",
	category: "processing",
	author: "Studio+233",
	tags: ["convert", "format", "images"],

	supportedInputTypes: ["image"],
	supportedOutputTypes: ["image"],
	supportedFormats: {
		input: ["jpg", "jpeg", "png", "webp"],
		output: ["jpg", "jpeg", "png", "webp"],
	},

	configFields: [
		{
			key: "targetFormat",
			label: "Target format",
			type: "select",
			defaultValue: "png",
			options: [
				{ label: "PNG", value: "png" },
				{ label: "JPEG", value: "jpeg" },
				{ label: "WebP", value: "webp" },
			],
		},
		{
			key: "quality",
			label: "Quality",
			type: "number",
			defaultValue: 90,
			min: 1,
			max: 100,
		},
		{
			key: "background",
			label: "Background",
			type: "color",
			defaultValue: "#ffffff",
		},
	],
	defaultConfig: {
		targetFormat: "png",
		quality: 90,
		background: "#ffffff",
	},

	configComponent: FormatConversionConfig,
	nodeComponent: FormatConversionNode,

	validateInput: (files): ValidationResult => {
		const errors: string[] = [];
		if (!files.length) errors.push("No input files provided");
		for (const file of files) {
			if (file.type !== "image") {
				errors.push(`File "${file.name}" is not an image`);
			}
		}
		return { valid: errors.length === 0, errors };
	},

	validateConfig: (config): ValidationResult => {
		const errors: string[] = [];
		if (
			!config.targetFormat ||
			!["png", "jpeg", "webp"].includes(config.targetFormat as string)
		) {
			errors.push("Target format must be png, jpeg, or webp");
		}
		const quality =
			typeof config.quality === "number"
				? config.quality
				: Number(config.quality ?? 90);
		if (Number.isNaN(quality) || quality < 1 || quality > 100) {
			errors.push("Quality must be between 1 and 100");
		}
		return { valid: errors.length === 0, errors };
	},

	execute: async (
		inputFiles: MediaFile[],
		config: PluginConfig,
		context: PluginExecutionContext,
	): Promise<MediaProcessingResult> => {
		const extended = context as ExtendedPluginExecutionContext;
		const targetFormat =
			(config.targetFormat as ConversionConfig["targetFormat"]) ?? "png";
		const quality =
			typeof config.quality === "number"
				? config.quality
				: Number(config.quality ?? 90);
		const background =
			typeof config.background === "string" ? config.background : "#ffffff";

		const validation = formatConversionPlugin.validateConfig({
			targetFormat,
			quality,
			background,
		});
		if (!validation.valid) {
			return {
				success: false,
				outputFiles: [],
				error: validation.errors.join(", "),
			};
		}

		const outputs: MediaFile[] = [];
		for (let index = 0; index < inputFiles.length; index++) {
			const file = inputFiles[index];
			if (file.type !== "image") {
				extended.logWarning(`Skipping ${file.name}: not an image`);
				continue;
			}

			extended.updateProgress(
				(index / inputFiles.length) * 90,
				`Converting ${file.name}`,
				file.name,
			);

			try {
				const output = await convertImage(file, {
					targetFormat,
					quality,
					background,
				});
				outputs.push(output);
				extended.onProgress?.({
					progress: ((index + 1) / inputFiles.length) * 100,
					status: `Converted ${index + 1}/${inputFiles.length}`,
					currentFile: file.name,
					completedFiles: index + 1,
					totalFiles: inputFiles.length,
				});
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Conversion failed";
				extended.logError(message);
			}
		}

		if (!outputs.length) {
			return { success: false, outputFiles: [], error: "No files converted" };
		}

		return { success: true, outputFiles: outputs };
	},
};
