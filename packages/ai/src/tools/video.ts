import { z } from "zod";
import { canvasToolOutputSchema } from "../schemas/tool-output";
import { createTool } from "./factory";

export const textToVideoTool = createTool({
	id: "text-to-video",
	description: "Generate cinematic clips using FAL-hosted video models",
	inputSchema: z.object({
		prompt: z.string().min(10),
		mode: z.enum(["quality", "fast"]).default("quality"),
		duration: z.number().min(2).max(12).default(6),
		aspectRatio: z.string().default("16:9"),
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { textToVideoWorkflow } = await import("../workflows/video");
		const result = await textToVideoWorkflow.run(context);

		const command =
			result.command && result.command.type === "add-video"
				? {
						...result.command,
						meta: {
							...(result.command.meta ?? {}),
							mode: context.mode,
						},
					}
				: result.command;

		return {
			...result,
			command,
			message:
				result.message ??
				(command
					? `Video generated successfully (${context.duration}s)`
					: undefined),
		};
	},
});

export const videoStitchTool = createTool({
	id: "video-stitch",
	description: "Concatenate clips with ffmpeg-ready command output",
	inputSchema: z.object({
		clips: z.array(
			z.object({
				url: z.string().url(),
				label: z.string().optional(),
			}),
		),
		transitions: z.array(z.enum(["cut", "fade", "slide"])).default(["cut"]),
		execute: z.boolean().default(false),
		format: z.enum(["mp4", "mov", "webm"]).default("mp4"),
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { videoStitchWorkflow } = await import("../workflows/video");
		const result = await videoStitchWorkflow.run(context);

		return {
			command: undefined,
			data: {
				ffmpegCommand: result.command,
				executed: result.executed,
				outputPath: result.outputPath,
			},
			message: result.executed
				? `Stitched ${context.clips.length} clips to ${result.outputPath}`
				: `Generated stitch command. Run with execute: true to process.`,
		};
	},
});

export const videoGifTool = createTool({
	id: "video-gif",
	description: "Convert video segments into shareable GIFs",
	inputSchema: z.object({
		videoUrl: z.string().url(),
		start: z.number().min(0).default(0),
		duration: z.number().min(1).max(8).default(3),
		width: z.number().min(256).max(1024).default(640),
		execute: z.boolean().default(false),
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { videoGifWorkflow } = await import("../workflows/video");
		const result = await videoGifWorkflow.run(context);

		return {
			command: undefined,
			data: {
				ffmpegCommand: result.command,
				executed: result.executed,
				gifPath: result.gifUrl,
			},
			message: result.executed
				? `Converted segment to GIF at ${result.gifUrl}`
				: `Generated GIF command. Run with execute: true to process.`,
		};
	},
});

export const captionOverlayTool = createTool({
	id: "caption-overlay",
	description:
		"Generate SRT captions and optional ffmpeg command to burn them in",
	inputSchema: z.object({
		videoUrl: z.string().url(),
		captions: z.array(
			z.object({
				text: z.string(),
				timecode: z.string(),
			}),
		),
		fontSize: z.number().min(16).max(72).default(36),
		execute: z.boolean().default(false),
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { captionOverlayWorkflow } = await import("../workflows/video");
		const result = await captionOverlayWorkflow.run(context);

		return {
			command: undefined,
			data: {
				srtContent: result.srt,
				ffmpegCommand: result.command,
				executed: result.executed,
				outputPath: result.outputPath,
			},
			message: result.executed
				? `Caption overlay complete. Output at ${result.outputPath}`
				: `Generated caption overlay command. Run with execute: true to process.`,
		};
	},
});
