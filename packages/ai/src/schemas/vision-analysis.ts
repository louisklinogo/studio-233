import { z } from "zod";

// --- EXACT Schema from debug.txt ---

const lightingSchema = z.object({
	source: z.string().nullable(),
	direction: z.string().nullable(),
	quality: z.string().nullable(),
	color_temp: z.string().nullable(),
});

const visualAttributesSchema = z.object({
	color: z.string().nullable(),
	texture: z.string().nullable(),
	material: z.string().nullable(),
	state: z.string().nullable(),
	dimensions_relative: z.string().nullable(),
});

const objectSchema = z.object({
	id: z.string(),
	label: z.string(),
	category: z.string().nullable(),
	location: z.string().nullable(),
	prominence: z.string().nullable(),
	visual_attributes: visualAttributesSchema,
	micro_details: z.array(z.string()).nullable(),
	pose_or_orientation: z.string().nullable(),
	text_content: z.string().nullable(),
});

const textOcrContentSchema = z.object({
	text: z.string(),
	location: z.string().nullable(),
	font_style: z.string().nullable(),
	legibility: z.string().nullable(),
});

export const visionAnalysisOutputSchema = z.object({
	meta: z.object({
		image_quality: z.enum(["Low", "Medium", "High"]).nullable(),
		image_type: z.string().nullable(),
		resolution_estimation: z.string().nullable(),
	}),
	global_context: z.object({
		scene_description: z.string(),
		time_of_day: z.string().nullable(),
		weather_atmosphere: z.string().nullable(),
		lighting: lightingSchema,
	}),
	color_palette: z.object({
		dominant_hex_estimates: z.array(z.string()),
		accent_colors: z.array(z.string()),
		contrast_level: z.string().nullable(),
	}),
	composition: z.object({
		camera_angle: z.string().nullable(),
		framing: z.string().nullable(),
		depth_of_field: z.string().nullable(),
		focal_point: z.string().nullable(),
	}),
	objects: z.array(objectSchema),
	text_ocr: z.object({
		present: z.boolean(),
		content: z.array(textOcrContentSchema).nullable(),
	}),
	semantic_relationships: z.array(z.string()),
});

export const visionAnalysisInputSchema = z.object({
	imageUrl: z.string().url(),
});

export type VisionAnalysisInput = z.infer<typeof visionAnalysisInputSchema>;
export type VisionAnalysisResult = z.infer<typeof visionAnalysisOutputSchema>;
