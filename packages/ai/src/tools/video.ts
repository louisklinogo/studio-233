import { createTool } from "@mastra/core/tools";
import { z } from "zod";
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
	outputSchema: textToVideoWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(textToVideoWorkflow, context),
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
	outputSchema: videoStitchWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(videoStitchWorkflow, context),
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
	outputSchema: videoGifWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(videoGifWorkflow, context),
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
	outputSchema: captionOverlayWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(captionOverlayWorkflow, context),
});
