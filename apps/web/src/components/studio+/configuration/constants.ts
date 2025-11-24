import { Code, Image as ImageIcon, Palette, User } from "lucide-react";

export type WorkflowType = "mannequin" | "style" | "logo" | "custom";

export const AVAILABLE_SCRIPTS = [
	{
		id: "mannequin",
		name: "mannequin_transfer.py",
		label: "Mannequin Transfer",
		icon: User,
		description:
			"Extracts clothing from input and warps onto reference mannequin.",
		params: [
			{
				name: "reference_image",
				label: "Reference Mannequin",
				type: "file",
				required: true,
			},
			{
				name: "mask_threshold",
				label: "Mask Threshold",
				type: "number",
				default: 0.5,
			},
		],
	},
	{
		id: "style",
		name: "style_transfer.py",
		label: "Style Transfer",
		icon: Palette,
		description: "Applies artistic style from reference image to target batch.",
		params: [
			{
				name: "style_reference",
				label: "Style Reference",
				type: "file",
				required: true,
			},
			{
				name: "strength",
				label: "Style Strength",
				type: "number",
				default: 0.8,
			},
			{
				name: "preserve_color",
				label: "Preserve Color",
				type: "boolean",
				default: false,
			},
		],
	},
	{
		id: "logo",
		name: "logo_adder.py",
		label: "Logo Overlay",
		icon: ImageIcon,
		description:
			"Composites logo file onto specific coordinates of target images.",
		params: [
			{ name: "logo_file", label: "Logo Image", type: "file", required: true },
			{
				name: "position",
				label: "Position",
				type: "select",
				options: ["Bottom Right", "Top Left", "Center"],
				default: "Bottom Right",
			},
			{ name: "scale", label: "Scale (%)", type: "number", default: 40 },
			{ name: "padding", label: "Padding (px)", type: "number", default: 20 },
		],
	},
	{
		id: "custom",
		name: "custom_pipeline.json",
		label: "Custom Pipeline",
		icon: Code,
		description: "Execute a custom transformation pipeline via prompt.",
		params: [
			{
				name: "prompt",
				label: "Prompt Override",
				type: "text",
				required: false,
			},
		],
	},
] as const;
