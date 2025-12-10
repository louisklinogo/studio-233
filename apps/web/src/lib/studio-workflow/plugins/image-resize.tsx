import { Expand } from "lucide-react";
import React, { useMemo, useState } from "react";
import type { ExtendedPluginExecutionContext } from "../execution-context";
import { canvasFromImage, getTargetDimensions, loadImage } from "./image-utils";
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

type ResizeConfig = {
	width?: number;
	height?: number;
	fitMode?: "contain" | "cover" | "stretch" | "scale-down";
	outputFormat?: "original" | "png" | "jpeg" | "webp";
	quality?: number;
};

function parseNumber(value: unknown): number | undefined {
	if (typeof value === "number" && !Number.isNaN(value)) return value;
	const numeric = Number(value);
	return Number.isNaN(numeric) ? undefined : numeric;
}

async function resizeImage(
	file: MediaFile,
	config: ResizeConfig,
): Promise<MediaFile> {
	const image = await loadImage(file.url);
	const fitMode = (config.fitMode ?? "contain") as NonNullable<
		ResizeConfig["fitMode"]
	>;
	const formatPreference = config.outputFormat ?? "original";
	const resolvedFormat = (
		formatPreference === "original"
			? (file.format.toLowerCase() as ResizeConfig["outputFormat"])
			: formatPreference
	) as NonNullable<ResizeConfig["outputFormat"]>;
	const target = getTargetDimensions(
		{ width: image.naturalWidth, height: image.naturalHeight },
		parseNumber(config.width),
		parseNumber(config.height),
		fitMode,
	);

	const canvas = await canvasFromImage(image, target);
	const format = resolvedFormat;
	const mimeTypeMap: Record<string, string> = {
		png: "image/png",
		jpeg: "image/jpeg",
		jpg: "image/jpeg",
		webp: "image/webp",
	};
	const mimeType = mimeTypeMap[format || ""] || `image/${format || "png"}`;
	const quality =
		typeof config.quality === "number"
			? Math.min(1, Math.max(0.01, config.quality / 100))
			: undefined;

	const blob: Blob = await new Promise((resolve, reject) => {
		canvas.toBlob(
			(value) => {
				if (value) {
					resolve(value);
					return;
				}
				reject(new Error("Failed to generate resized image"));
			},
			mimeType,
			quality,
		);
	});

	const url = URL.createObjectURL(blob);
	const outputFormat = (format || "png").toLowerCase();

	return {
		id: `${file.id}_resized`,
		url,
		name: file.name.replace(/\.[^.]+$/, `_resized.${outputFormat}`),
		type: "image",
		format: outputFormat,
		size: blob.size,
		width: target.width,
		height: target.height,
		metadata: {
			...file.metadata,
			processedBy: "image-resize",
			target,
			outputFormat,
		},
	};
}

function ImageResizeConfig({
	config,
	onChange,
	errors,
}: PluginConfigComponentProps): React.JSX.Element {
	const [local, setLocal] = useState<ResizeConfig>({
		width: 1080,
		height: 1080,
		fitMode: "contain",
		outputFormat: "original",
		quality: 90,
		...config,
	});

	const update = (next: Partial<ResizeConfig>) => {
		const merged = { ...local, ...next };
		setLocal(merged);
		onChange(merged as PluginConfig);
	};

	return (
		<div className="space-y-4 text-sm">
			<div className="grid grid-cols-2 gap-3">
				<label className="space-y-1">
					<span className="text-xs text-neutral-500">Width (px)</span>
					<input
						type="number"
						min={1}
						value={local.width ?? ""}
						onChange={(e) =>
							update({
								width: e.target.value ? Number(e.target.value) : undefined,
							})
						}
						className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1"
					/>
					{errors?.width && (
						<p className="text-[11px] text-red-500">{errors.width}</p>
					)}
				</label>
				<label className="space-y-1">
					<span className="text-xs text-neutral-500">Height (px)</span>
					<input
						type="number"
						min={1}
						value={local.height ?? ""}
						onChange={(e) =>
							update({
								height: e.target.value ? Number(e.target.value) : undefined,
							})
						}
						className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1"
					/>
					{errors?.height && (
						<p className="text-[11px] text-red-500">{errors.height}</p>
					)}
				</label>
			</div>

			<label className="space-y-1 block">
				<span className="text-xs text-neutral-500">Fit mode</span>
				<select
					value={local.fitMode}
					onChange={(e) =>
						update({ fitMode: e.target.value as ResizeConfig["fitMode"] })
					}
					className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1"
				>
					<option value="contain">Contain (preserve aspect)</option>
					<option value="cover">Cover (fill, may crop)</option>
					<option value="scale-down">Scale down only</option>
					<option value="stretch">Stretch</option>
				</select>
			</label>

			<div className="grid grid-cols-2 gap-3">
				<label className="space-y-1">
					<span className="text-xs text-neutral-500">Format</span>
					<select
						value={local.outputFormat}
						onChange={(e) =>
							update({
								outputFormat: e.target.value as ResizeConfig["outputFormat"],
							})
						}
						className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1"
					>
						<option value="original">Keep original</option>
						<option value="png">PNG</option>
						<option value="jpeg">JPEG</option>
						<option value="webp">WebP</option>
					</select>
				</label>
				<label className="space-y-1">
					<span className="text-xs text-neutral-500">Quality</span>
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
				</label>
			</div>
		</div>
	);
}

function ImageResizeNode({ data, selected }: PluginNodeComponentProps) {
	const config = data.config as ResizeConfig | undefined;
	return (
		<div
			className={`p-4 border-2 rounded-lg bg-white ${
				selected ? "border-neutral-900" : "border-neutral-200"
			}`}
		>
			<div className="flex items-center gap-2 mb-2">
				<Expand className="w-5 h-5 text-neutral-900" />
				<h3 className="font-semibold">{data.label || "Resize"}</h3>
			</div>
			<p className="text-xs text-neutral-500 mb-2">
				{data.description || "Resize images to target dimensions."}
			</p>
			<div className="text-[11px] space-y-1 text-neutral-700">
				<p>Fit: {config?.fitMode ?? "contain"}</p>
				<p>
					Target: {(config?.width && `${config.width}px`) || "auto"} ×
					{(config?.height && `${config.height}px`) || "auto"}
				</p>
				<p>Format: {config?.outputFormat || "original"}</p>
			</div>
		</div>
	);
}

export const imageResizePlugin: MediaPlugin = {
	id: "image-resize",
	name: "Resize Images",
	description: "Resize images with fit modes and optional reformatting.",
	version: "1.0.0",
	category: "processing",
	author: "Studio+233",
	tags: ["resize", "scale", "images"],

	supportedInputTypes: ["image"],
	supportedOutputTypes: ["image"],
	supportedFormats: {
		input: ["jpg", "jpeg", "png", "webp"],
		output: ["jpg", "jpeg", "png", "webp"],
	},

	configFields: [
		{ key: "width", label: "Width", type: "number", required: false },
		{ key: "height", label: "Height", type: "number", required: false },
		{
			key: "fitMode",
			label: "Fit mode",
			type: "select",
			defaultValue: "contain",
			options: [
				{ label: "Contain", value: "contain" },
				{ label: "Cover", value: "cover" },
				{ label: "Scale down", value: "scale-down" },
				{ label: "Stretch", value: "stretch" },
			],
		},
		{
			key: "outputFormat",
			label: "Format",
			type: "select",
			defaultValue: "original",
			options: [
				{ label: "Original", value: "original" },
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
	],
	defaultConfig: {
		width: 1080,
		height: 1080,
		fitMode: "contain",
		outputFormat: "original",
		quality: 90,
	},

	configComponent: ImageResizeConfig,
	nodeComponent: ImageResizeNode,

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
		const width = parseNumber(config.width);
		const height = parseNumber(config.height);
		if (width !== undefined && width <= 0)
			errors.push("Width must be positive");
		if (height !== undefined && height <= 0)
			errors.push("Height must be positive");

		const fitModeValue = config.fitMode as ResizeConfig["fitMode"] | undefined;
		if (
			fitModeValue !== undefined &&
			!(
				["contain", "cover", "stretch", "scale-down"] as readonly NonNullable<
					ResizeConfig["fitMode"]
				>[]
			).includes(fitModeValue as NonNullable<ResizeConfig["fitMode"]>)
		) {
			errors.push("Invalid fit mode");
		}

		const outputFormatValue = config.outputFormat as
			| ResizeConfig["outputFormat"]
			| undefined;
		if (
			outputFormatValue !== undefined &&
			!(
				["original", "png", "jpeg", "webp"] as readonly NonNullable<
					ResizeConfig["outputFormat"]
				>[]
			).includes(outputFormatValue as NonNullable<ResizeConfig["outputFormat"]>)
		) {
			errors.push("Invalid output format");
		}

		const quality = parseNumber(config.quality);
		if (quality !== undefined && (quality < 1 || quality > 100)) {
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
		const parsed: ResizeConfig & {
			fitMode: NonNullable<ResizeConfig["fitMode"]>;
			outputFormat: NonNullable<ResizeConfig["outputFormat"]>;
		} = {
			width: parseNumber(config.width),
			height: parseNumber(config.height),
			fitMode: ((config.fitMode as ResizeConfig["fitMode"]) ??
				"contain") as NonNullable<ResizeConfig["fitMode"]>,
			outputFormat: ((config.outputFormat as ResizeConfig["outputFormat"]) ??
				"original") as NonNullable<ResizeConfig["outputFormat"]>,
			quality:
				typeof config.quality === "number"
					? config.quality
					: (parseNumber(config.quality) ?? 90),
		};

		const validation = imageResizePlugin.validateConfig(parsed);
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
				`Resizing ${file.name}`,
				file.name,
			);

			try {
				const output = await resizeImage(file, parsed);
				outputs.push(output);
				const completed = index + 1;
				extended.onProgress?.({
					progress: (completed / inputFiles.length) * 100,
					status: `Resized ${completed}/${inputFiles.length}`,
					currentFile: file.name,
					completedFiles: completed,
					totalFiles: inputFiles.length,
				});
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Resize failed";
				extended.logError(message);
			}
		}

		if (!outputs.length) {
			return { success: false, outputFiles: [], error: "No files resized" };
		}

		return { success: true, outputFiles: outputs };
	},
};
