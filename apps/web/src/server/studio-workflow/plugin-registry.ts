import {
	backgroundRemovalWorkflow,
	imageReframeWorkflow,
	imageUpscaleWorkflow,
	paletteExtractionWorkflow,
	uploadImageBufferToBlob,
} from "@studio233/ai";
import sharp from "sharp";
import { z } from "zod";
import type { MediaFile } from "@/lib/studio-workflow/plugins/types";

export type StudioExecutor = "native" | "python-e2b";

export type StudioPluginRunResult = {
	outputFiles: MediaFile[];
	metadata?: Record<string, unknown>;
};

export type StudioPluginContext = {
	runId: string;
	workflowId: string;
	nodeId: string;
	projectId: string;
	userId: string;
};

export type StudioPluginDefinition = {
	id: string;
	version: string;
	executor: StudioExecutor;
	configSchema: z.ZodTypeAny;
	supportedInputTypes?: Array<MediaFile["type"]>;
	run: (
		inputFiles: MediaFile[],
		config: Record<string, unknown>,
		ctx: StudioPluginContext,
	) => Promise<StudioPluginRunResult>;
};

async function downloadToBuffer(url: string): Promise<Buffer> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(
			`Failed to download input: ${response.status} ${response.statusText}`,
		);
	}
	return Buffer.from(await response.arrayBuffer());
}

function toMediaTypeFromMime(mime: string): MediaFile["type"] {
	if (mime.startsWith("image/")) return "image";
	if (mime.startsWith("video/")) return "video";
	if (mime.startsWith("audio/")) return "audio";
	return "image";
}

function normalizeFormat(format: string) {
	return format.replace(/^\./, "").toLowerCase();
}

const mediaInputConfigSchema = z
	.object({
		maxFiles: z.number().int().min(1).max(100).optional().default(10),
		maxSizePerFileMb: z.number().int().min(1).max(500).optional().default(50),
	})
	.passthrough();

const imageResizeConfigSchema = z
	.object({
		width: z.number().int().positive().optional(),
		height: z.number().int().positive().optional(),
		fitMode: z
			.enum(["contain", "cover", "stretch", "scale-down"])
			.optional()
			.default("contain"),
		outputFormat: z
			.enum(["original", "png", "jpeg", "webp"])
			.optional()
			.default("original"),
		quality: z.number().int().min(1).max(100).optional().default(90),
	})
	.passthrough();

const formatConversionConfigSchema = z
	.object({
		targetFormat: z.enum(["png", "jpeg", "webp"]).default("png"),
		quality: z.number().int().min(1).max(100).optional().default(90),
		background: z
			.string()
			.regex(/^#[0-9A-Fa-f]{6}$/)
			.optional()
			.default("#ffffff"),
	})
	.passthrough();

const backgroundRemovalConfigSchema = z
	.object({
		provider: z.enum(["auto", "fal", "gemini"]).optional().default("auto"),
		apiKey: z.string().optional(),
	})
	.passthrough();

const pythonScriptConfigSchema = z
	.object({
		scriptRef: z.string().min(1),
		args: z.array(z.string()).optional().default([]),
		env: z.record(z.string(), z.string()).optional().default({}),
	})
	.passthrough();

const imageUpscaleConfigSchema = z
	.object({
		scale: z.number().min(1).max(4).optional().default(2),
		maxDimension: z.number().min(512).max(4096).optional().default(2048),
	})
	.passthrough();

const imageReframeConfigSchema = z
	.object({
		targetWidth: z.number().int().positive().optional().default(1080),
		targetHeight: z.number().int().positive().optional().default(1080),
		strategy: z
			.enum(["cover", "contain", "attention"])
			.optional()
			.default("cover"),
	})
	.passthrough();

const paletteExtractionConfigSchema = z
	.object({
		colors: z.number().int().min(3).max(12).optional().default(6),
	})
	.passthrough();

const ALLOWLISTED_PYTHON_SCRIPTS = new Set([
	"accessory_detector.py",
	"ai_prompt_generator.py",
	"clean_processor.py",
	"csv_prompt_generator.py",
	"detection_data_loader.py",
	"image_correction_implementer.py",
	"new_designs_processor.py",
	"product_processor.py",
	"reference_style_transfer.py",
	"targeted_image_corrector.py",
	"trouser_adder.py",
	"veo3_video_generator.py",
	"watermark_remover.py",
]);

async function runPythonInE2B(
	_config: z.infer<typeof pythonScriptConfigSchema>,
): Promise<never> {
	throw new Error(
		"Python execution is not configured. This workflow includes a python-e2b node, but the E2B executor is not enabled in this deployment.",
	);
}

const plugins: StudioPluginDefinition[] = [
	{
		id: "media-input",
		version: "1.0.0",
		executor: "native",
		configSchema: mediaInputConfigSchema,
		run: async (inputFiles, configRaw) => {
			const config = mediaInputConfigSchema.parse(configRaw);
			const maxBytes = config.maxSizePerFileMb * 1024 * 1024;
			const accepted = inputFiles
				.filter((file) => file.size <= maxBytes)
				.slice(0, config.maxFiles);
			return {
				outputFiles: accepted,
				metadata: {
					filesIn: inputFiles.length,
					filesOut: accepted.length,
					maxFiles: config.maxFiles,
					maxSizePerFileMb: config.maxSizePerFileMb,
				},
			};
		},
	},
	{
		id: "media-output",
		version: "1.0.0",
		executor: "native",
		configSchema: z.object({}).passthrough(),
		run: async (inputFiles) => {
			return {
				outputFiles: inputFiles,
				metadata: { kind: "output" },
			};
		},
	},
	{
		id: "background-removal",
		version: "1.0.0",
		executor: "native",
		configSchema: backgroundRemovalConfigSchema,
		supportedInputTypes: ["image"],
		run: async (inputFiles, configRaw) => {
			const config = backgroundRemovalConfigSchema.parse(configRaw);
			const outputFiles: MediaFile[] = [];

			for (const file of inputFiles) {
				if (file.type !== "image") continue;
				const result = await backgroundRemovalWorkflow.run({
					imageUrl: file.url,
					apiKey: config.apiKey,
					provider: config.provider,
				});
				outputFiles.push({
					...file,
					id: `${file.id}_no_bg`,
					url: result.imageUrl,
					name: file.name.replace(/\.[^.]+$/, "_no_bg.png"),
					format: "png",
					metadata: {
						...(file.metadata ?? {}),
						processedBy: "background-removal",
						provider: result.provider,
						verified: result.verified,
						qualityScore: result.qualityScore,
					},
				});
			}

			return { outputFiles };
		},
	},
	{
		id: "image-upscale",
		version: "1.0.0",
		executor: "native",
		configSchema: imageUpscaleConfigSchema,
		supportedInputTypes: ["image"],
		run: async (inputFiles, configRaw) => {
			const config = imageUpscaleConfigSchema.parse(configRaw);
			const outputFiles: MediaFile[] = [];

			for (const file of inputFiles) {
				if (file.type !== "image") continue;
				const result = await imageUpscaleWorkflow.run({
					imageUrl: file.url,
					scale: config.scale,
					maxDimension: config.maxDimension,
				});
				outputFiles.push({
					...file,
					id: `${file.id}_upscaled`,
					url: result.imageUrl,
					name: file.name.replace(/\.[^.]+$/, "_upscaled.png"),
					format: "png",
					width: result.width,
					height: result.height,
					metadata: {
						...(file.metadata ?? {}),
						processedBy: "image-upscale",
						config,
					},
				});
			}

			return { outputFiles };
		},
	},
	{
		id: "image-reframe",
		version: "1.0.0",
		executor: "native",
		configSchema: imageReframeConfigSchema,
		supportedInputTypes: ["image"],
		run: async (inputFiles, configRaw) => {
			const config = imageReframeConfigSchema.parse(configRaw);
			const outputFiles: MediaFile[] = [];

			for (const file of inputFiles) {
				if (file.type !== "image") continue;
				const result = await imageReframeWorkflow.run({
					imageUrl: file.url,
					targetWidth: config.targetWidth,
					targetHeight: config.targetHeight,
					strategy: config.strategy,
				});
				outputFiles.push({
					...file,
					id: `${file.id}_reframed`,
					url: result.imageUrl,
					name: file.name.replace(/\.[^.]+$/, "_reframed.png"),
					format: "png",
					width: result.width,
					height: result.height,
					metadata: {
						...(file.metadata ?? {}),
						processedBy: "image-reframe",
						config,
						strategy: result.strategy,
					},
				});
			}

			return { outputFiles };
		},
	},
	{
		id: "palette-extraction",
		version: "1.0.0",
		executor: "native",
		configSchema: paletteExtractionConfigSchema,
		supportedInputTypes: ["image"],
		run: async (inputFiles, configRaw) => {
			const config = paletteExtractionConfigSchema.parse(configRaw);
			const palettes: Array<{ fileId: string; palette: unknown }> = [];
			for (const file of inputFiles) {
				if (file.type !== "image") continue;
				const result = await paletteExtractionWorkflow.run({
					imageUrl: file.url,
					colors: config.colors,
				});
				palettes.push({ fileId: file.id, palette: result.palette });
			}
			return {
				outputFiles: inputFiles,
				metadata: { palettes, config },
			};
		},
	},
	{
		id: "image-resize",
		version: "1.0.0",
		executor: "native",
		configSchema: imageResizeConfigSchema,
		supportedInputTypes: ["image"],
		run: async (inputFiles, configRaw) => {
			const config = imageResizeConfigSchema.parse(configRaw);
			const outputFiles: MediaFile[] = [];

			for (const file of inputFiles) {
				if (file.type !== "image") continue;
				const inputBuffer = await downloadToBuffer(file.url);
				const source = sharp(inputBuffer);

				const resolvedFormat =
					config.outputFormat === "original"
						? normalizeFormat(file.format)
						: config.outputFormat;

				const fitModeMap: Record<
					NonNullable<z.infer<typeof imageResizeConfigSchema>["fitMode"]>,
					keyof sharp.FitEnum
				> = {
					contain: "contain",
					cover: "cover",
					stretch: "fill",
					"scale-down": "inside",
				};

				let pipeline = source.resize({
					width: config.width,
					height: config.height,
					fit: fitModeMap[config.fitMode],
					withoutEnlargement: config.fitMode === "scale-down",
				});

				if (resolvedFormat === "jpeg") {
					pipeline = pipeline.jpeg({ quality: config.quality });
				} else if (resolvedFormat === "png") {
					pipeline = pipeline.png({ quality: config.quality });
				} else if (resolvedFormat === "webp") {
					pipeline = pipeline.webp({ quality: config.quality });
				}

				const outputBuffer = await pipeline.toBuffer();
				const outputMeta = await sharp(outputBuffer).metadata();
				const contentType = `image/${resolvedFormat === "jpeg" ? "jpeg" : resolvedFormat}`;
				const url = await uploadImageBufferToBlob(outputBuffer, {
					contentType,
					prefix: "studio/workflows/image-resize",
					extension: resolvedFormat,
				});

				outputFiles.push({
					...file,
					id: `${file.id}_resized`,
					url,
					name: file.name.replace(/\.[^.]+$/, `_resized.${resolvedFormat}`),
					format: resolvedFormat,
					size: outputBuffer.byteLength,
					width: outputMeta.width ?? file.width,
					height: outputMeta.height ?? file.height,
					metadata: {
						...(file.metadata ?? {}),
						processedBy: "image-resize",
						config,
					},
				});
			}

			return { outputFiles };
		},
	},
	{
		id: "format-conversion",
		version: "1.0.0",
		executor: "native",
		configSchema: formatConversionConfigSchema,
		supportedInputTypes: ["image"],
		run: async (inputFiles, configRaw) => {
			const config = formatConversionConfigSchema.parse(configRaw);
			const outputFiles: MediaFile[] = [];

			for (const file of inputFiles) {
				if (file.type !== "image") continue;
				const inputBuffer = await downloadToBuffer(file.url);
				let pipeline = sharp(inputBuffer);

				if (config.targetFormat === "jpeg") {
					pipeline = pipeline.flatten({ background: config.background });
					pipeline = pipeline.jpeg({ quality: config.quality });
				} else if (config.targetFormat === "png") {
					pipeline = pipeline.png({ quality: config.quality });
				} else {
					pipeline = pipeline.webp({ quality: config.quality });
				}

				const outputBuffer = await pipeline.toBuffer();
				const outputMeta = await sharp(outputBuffer).metadata();
				const contentType = `image/${config.targetFormat}`;
				const url = await uploadImageBufferToBlob(outputBuffer, {
					contentType,
					prefix: "studio/workflows/format-conversion",
					extension: config.targetFormat,
				});

				outputFiles.push({
					...file,
					id: `${file.id}_${config.targetFormat}`,
					url,
					name: file.name.replace(/\.[^.]+$/, `.${config.targetFormat}`),
					format: config.targetFormat,
					size: outputBuffer.byteLength,
					width: outputMeta.width ?? file.width,
					height: outputMeta.height ?? file.height,
					metadata: {
						...(file.metadata ?? {}),
						processedBy: "format-conversion",
						config,
					},
				});
			}

			return { outputFiles };
		},
	},
	{
		id: "python-script",
		version: "1.0.0",
		executor: "python-e2b",
		configSchema: pythonScriptConfigSchema,
		run: async (_inputFiles, configRaw): Promise<StudioPluginRunResult> => {
			const config = pythonScriptConfigSchema.parse(configRaw);
			const scriptName = config.scriptRef.replace(/^scripts\/py\//, "");
			if (!ALLOWLISTED_PYTHON_SCRIPTS.has(scriptName)) {
				throw new Error(
					`Python script is not allowlisted: ${config.scriptRef}. This deployment only permits curated scripts in scripts/py/.`,
				);
			}

			await runPythonInE2B(config);
			return { outputFiles: [] };
		},
	},
];

export function getStudioPlugin(pluginId: string): StudioPluginDefinition {
	const plugin = plugins.find((p) => p.id === pluginId);
	if (!plugin) {
		throw new Error(`Unknown pluginId: ${pluginId}`);
	}
	return plugin;
}

export function listStudioPlugins(): StudioPluginDefinition[] {
	return plugins;
}

export function validateStudioPluginConfig(
	pluginId: string,
	config: Record<string, unknown> | undefined,
) {
	const plugin = getStudioPlugin(pluginId);
	return plugin.configSchema.parse(config ?? {});
}

export function coerceMediaFile(input: unknown): MediaFile | null {
	if (!input || typeof input !== "object") return null;
	const value = input as Record<string, unknown>;
	if (typeof value.url !== "string" || typeof value.name !== "string")
		return null;

	const id = typeof value.id === "string" ? value.id : value.url;
	const format = typeof value.format === "string" ? value.format : "";
	const size = typeof value.size === "number" ? value.size : 0;
	const metadata =
		value.metadata && typeof value.metadata === "object"
			? (value.metadata as Record<string, unknown>)
			: undefined;
	const mime =
		metadata && typeof metadata.mimeType === "string" ? metadata.mimeType : "";
	const type =
		typeof value.type === "string"
			? (value.type as MediaFile["type"])
			: toMediaTypeFromMime(mime);

	return {
		id,
		url: value.url,
		name: value.name,
		type,
		format,
		size,
		width: typeof value.width === "number" ? value.width : undefined,
		height: typeof value.height === "number" ? value.height : undefined,
		duration: typeof value.duration === "number" ? value.duration : undefined,
		metadata,
	};
}
