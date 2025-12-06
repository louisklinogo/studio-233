export const AVAILABLE_MODELS = [
	{ id: "gemini-2.5-flash-image-preview", name: "Nano Banana" },
	{ id: "flux-pro", name: "Flux Pro" },
	{ id: "stable-diffusion-3", name: "Stable Diffusion 3" },
] as const;

export const ASPECT_RATIOS = [
	{ id: "1:1", label: "Square (1:1)" },
	{ id: "16:9", label: "Landscape (16:9)" },
	{ id: "9:16", label: "Portrait (9:16)" },
	{ id: "4:3", label: "Standard (4:3)" },
	{ id: "3:4", label: "Portrait (3:4)" },
	{ id: "21:9", label: "Cinematic (21:9)" },
	{ id: "3:2", label: "Classic (3:2)" },
	{ id: "2:3", label: "Classic Portrait (2:3)" },
	{ id: "5:4", label: "Medium Format (5:4)" },
	{ id: "4:5", label: "Social Portrait (4:5)" },
] as const;

export type ImageModelId = (typeof AVAILABLE_MODELS)[number]["id"];
export type ImageAspectRatio = (typeof ASPECT_RATIOS)[number]["id"];
