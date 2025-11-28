import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createFalClient } from "@fal-ai/client";
import { z } from "zod";

import { getEnv } from "../config";
import { canvasToolOutputSchema } from "../schemas/tool-output";

const env = getEnv();

const TEXT_TO_VIDEO_MODELS: Record<"quality" | "fast", string> = {
	quality: "fal-ai/kling-v2",
	fast: "fal-ai/kling-v2-fast",
};

export const textToVideoInputSchema = z.object({
	prompt: z.string().min(10),
	mode: z.enum(["quality", "fast"]).default("quality"),
	duration: z.number().min(2).max(12).default(6),
	aspectRatio: z.string().default("16:9"),
});

export const textToVideoOutputSchema = canvasToolOutputSchema;

export type TextToVideoInput = z.infer<typeof textToVideoInputSchema>;
export type TextToVideoResult = z.infer<typeof textToVideoOutputSchema>;

export async function runTextToVideoWorkflow(
	input: TextToVideoInput,
): Promise<TextToVideoResult> {
	const { prompt, mode, duration, aspectRatio } = input;
	if (!env.falKey) {
		return {
			message: `Render ${duration}s video at ${aspectRatio} using ${mode} mode. Prompt: ${prompt} (Planned - No Key)`,
		};
	}

	const client = createFalClient({ credentials: () => env.falKey! });
	const model = TEXT_TO_VIDEO_MODELS[mode];
	const result = await client.subscribe(model, {
		input: {
			prompt,
			duration,
			aspect_ratio: aspectRatio,
		},
	});
	const videoUrl = result?.data?.video?.url;

	if (!videoUrl) {
		return {
			message: `Model ${model} accepted prompt but did not return a URL.`,
		};
	}

	const [w, h] = aspectRatio.split(":").map(Number);
	const width = w && h ? (1024 / w) * w : 1024;
	const height = w && h ? (1024 / w) * h : 576;

	return {
		command: {
			type: "add-video",
			url: videoUrl,
			width: Math.round(width),
			height: Math.round(height),
			duration,
			meta: {
				prompt,
				provider: model,
			},
		},
	};
}

export const textToVideoWorkflow = {
	id: "text-to-video",
	inputSchema: textToVideoInputSchema,
	outputSchema: textToVideoOutputSchema,
	run: runTextToVideoWorkflow,
};

export const videoStitchInputSchema = z.object({
	clips: z
		.array(z.object({ url: z.string().url(), label: z.string().optional() }))
		.min(2),
	transitions: z.array(z.enum(["cut", "fade", "slide"])).default(["cut"]),
	execute: z.boolean().default(false),
	format: z.enum(["mp4", "mov", "webm"]).default("mp4"),
});

export const videoStitchOutputSchema = z.object({
	command: z.string(),
	outputPath: z.string().optional(),
	executed: z.boolean(),
});

export type VideoStitchInput = z.infer<typeof videoStitchInputSchema>;
export type VideoStitchResult = z.infer<typeof videoStitchOutputSchema>;

export async function runVideoStitchWorkflow(
	input: VideoStitchInput,
): Promise<VideoStitchResult> {
	const { clips, execute, format } = input;
	const ffmpeg = env.ffmpegPath;
	const concatFile = clips.map((clip) => `file '${clip.url}'`).join("\n");
	const tmpDir = join(tmpdir(), "studio233-video", randomUUID());
	await mkdir(tmpDir, { recursive: true });
	const listFile = join(tmpDir, "clips.txt");
	await writeFile(listFile, concatFile, "utf-8");
	const outputPath = join(tmpDir, `stitched.${format}`);
	const command = `${ffmpeg ?? "ffmpeg"} -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}"`;

	if (!execute || !ffmpeg) {
		return { command, executed: false as const };
	}

	await new Promise<void>((resolve, reject) => {
		const child = spawn(ffmpeg, [
			"-f",
			"concat",
			"-safe",
			"0",
			"-i",
			listFile,
			"-c",
			"copy",
			outputPath,
		]);
		child.once("error", reject);
		child.once("exit", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`ffmpeg exited with code ${code}`));
			}
		});
	});

	return { command, executed: true as const, outputPath };
}

export const videoStitchWorkflow = {
	id: "video-stitch",
	inputSchema: videoStitchInputSchema,
	outputSchema: videoStitchOutputSchema,
	run: runVideoStitchWorkflow,
};

export const videoGifInputSchema = z.object({
	videoUrl: z.string().url(),
	start: z.number().min(0).default(0),
	duration: z.number().min(1).max(8).default(3),
	width: z.number().min(256).max(1024).default(640),
	execute: z.boolean().default(false),
});

export const videoGifOutputSchema = z.object({
	gifUrl: z.string().optional(),
	command: z.string(),
	executed: z.boolean(),
});

export type VideoGifInput = z.infer<typeof videoGifInputSchema>;
export type VideoGifResult = z.infer<typeof videoGifOutputSchema>;

export async function runVideoGifWorkflow(
	input: VideoGifInput,
): Promise<VideoGifResult> {
	const { videoUrl, start, duration, width, execute } = input;
	const ffmpeg = env.ffmpegPath;
	const tmpDir = join(tmpdir(), "studio233-gif", randomUUID());
	await mkdir(tmpDir, { recursive: true });
	const outputPath = join(tmpDir, "clip.gif");
	const command = `${ffmpeg ?? "ffmpeg"} -ss ${start} -t ${duration} -i "${videoUrl}" -vf "scale=${width}:-1:flags=lanczos" -gifflags -transdiff -y "${outputPath}"`;

	if (!execute || !ffmpeg) {
		return { command, executed: false as const };
	}

	await new Promise<void>((resolve, reject) => {
		const child = spawn(ffmpeg, [
			"-ss",
			String(start),
			"-t",
			String(duration),
			"-i",
			videoUrl,
			"-vf",
			`scale=${width}:-1:flags=lanczos`,
			"-gifflags",
			"-transdiff",
			"-y",
			outputPath,
		]);
		child.once("error", reject);
		child.once("exit", (code) => {
			if (code === 0) resolve();
			else reject(new Error(`ffmpeg exited with code ${code}`));
		});
	});

	return { command, executed: true as const, gifUrl: outputPath };
}

export const videoGifWorkflow = {
	id: "video-gif",
	inputSchema: videoGifInputSchema,
	outputSchema: videoGifOutputSchema,
	run: runVideoGifWorkflow,
};

export const captionOverlayInputSchema = z.object({
	videoUrl: z.string().url(),
	captions: z
		.array(
			z.object({
				text: z.string(),
				timecode: z.string(),
			}),
		)
		.min(1),
	fontSize: z.number().min(16).max(72).default(36),
	execute: z.boolean().default(false),
});

export const captionOverlayOutputSchema = z.object({
	srt: z.string(),
	command: z.string(),
	executed: z.boolean(),
	outputPath: z.string().optional(),
});

export type CaptionOverlayInput = z.infer<typeof captionOverlayInputSchema>;
export type CaptionOverlayResult = z.infer<typeof captionOverlayOutputSchema>;

export async function runCaptionOverlayWorkflow(
	input: CaptionOverlayInput,
): Promise<CaptionOverlayResult> {
	const { videoUrl, captions, fontSize, execute } = input;
	const ffmpeg = env.ffmpegPath;
	const tmpDir = join(tmpdir(), "studio233-caption", randomUUID());
	await mkdir(tmpDir, { recursive: true });
	const srtPath = join(tmpDir, "captions.srt");
	const outputPath = join(tmpDir, "captioned.mp4");
	const srtContent = captions
		.map((caption, idx) => `${idx + 1}\n${caption.timecode}\n${caption.text}\n`)
		.join("\n");
	await writeFile(srtPath, srtContent, "utf-8");
	const command = `${ffmpeg ?? "ffmpeg"} -i "${videoUrl}" -vf subtitles='${srtPath}:force_style=Fontsize=${fontSize}' -y "${outputPath}"`;

	if (!execute || !ffmpeg) {
		return { srt: srtContent, command, executed: false as const };
	}

	await new Promise<void>((resolve, reject) => {
		const child = spawn(ffmpeg, [
			"-i",
			videoUrl,
			"-vf",
			`subtitles=${srtPath}:force_style=Fontsize=${fontSize}`,
			"-y",
			outputPath,
		]);
		child.once("error", reject);
		child.once("exit", (code) => {
			if (code === 0) resolve();
			else reject(new Error(`ffmpeg exited with code ${code}`));
		});
	});

	return { srt: srtContent, command, executed: true as const, outputPath };
}

export const captionOverlayWorkflow = {
	id: "caption-overlay",
	inputSchema: captionOverlayInputSchema,
	outputSchema: captionOverlayOutputSchema,
	run: runCaptionOverlayWorkflow,
};
