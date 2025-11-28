import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { canvasToolOutputSchema } from "../schemas/tool-output";
import { runWorkflow } from "../utils/run-workflow";
import {
	captionOverlayWorkflow,
	textToVideoWorkflow,
	videoGifWorkflow,
	videoStitchWorkflow,
} from "../workflows/video";

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
		const result = await runWorkflow(textToVideoWorkflow, context);

		return {
			command: {
				type: "add-video" as const,
				url: result.videoUrl,
				width: 1920, // Default based on aspect ratio
				height: 1080,
				duration: context.duration,
				meta: {
					prompt: context.prompt,
					modelId: result.modelId,
					provider: result.provider,
					mode: context.mode,
				},
			},
			message: `Video generated successfully (${context.duration}s)`,
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
		const result = await runWorkflow(videoStitchWorkflow, context);

		return {
			command: result.videoUrl
				? {
						type: "add-video" as const,
						url: result.videoUrl,
						width: 1920,
						height: 1080,
						duration: result.totalDuration || 0,
						meta: {
							operation: "video-stitch",
							clipCount: context.clips.length,
							format: context.format,
						},
					}
				: undefined,
			data: {
				ffmpegCommand: result.ffmpegCommand,
			},
			message: result.videoUrl
				? `Stitched ${context.clips.length} clips successfully`
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
		const result = await runWorkflow(videoGifWorkflow, context);

		return {
			command: result.gifUrl
				? {
						type: "add-image" as const, // GIF is treated as image
						url: result.gifUrl,
						width: context.width,
						height: Math.round(context.width / 1.77), // Assume 16:9
						meta: {
							operation: "video-to-gif",
							duration: context.duration,
							isAnimated: true,
						},
					}
				: undefined,
			data: {
				ffmpegCommand: result.ffmpegCommand,
			},
			message: result.gifUrl
				? `Converted to GIF (${context.duration}s)`
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
		const result = await runWorkflow(captionOverlayWorkflow, context);

		return {
			command: result.videoUrl
				? {
						type: "add-video" as const,
						url: result.videoUrl,
						width: 1920,
						height: 1080,
						duration: 0, // Duration from original video
						meta: {
							operation: "caption-overlay",
							captionCount: context.captions.length,
						},
					}
				: undefined,
			data: {
				srtContent: result.srtContent,
				ffmpegCommand: result.ffmpegCommand,
			},
			message: result.videoUrl
				? `Added ${context.captions.length} captions to video`
				: `Generated caption overlay command. Run with execute: true to process.`,
		};
	},
});
