export type TemplateCategory =
	| "ALL"
	| "FASHION"
	| "INTERIOR"
	| "ARCHITECTURE"
	| "TECH";

export interface Template {
	id: string;
	category: TemplateCategory;
	label: string;
	prompt: string;
	metadata?: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
	"ALL",
	"FASHION",
	"INTERIOR",
	"ARCHITECTURE",
	"TECH",
];

export const TEMPLATES: Template[] = [
	// FASHION
	{
		id: "fashion-editorial",
		category: "FASHION",
		label: "HIGH EDITORIAL",
		prompt:
			"High-end fashion editorial, avant-garde style, dramatic lighting, sharp focus, 8k resolution, minimalist background, vogue style.",
		metadata: "01 // REF",
	},
	{
		id: "fashion-street",
		category: "FASHION",
		label: "URBAN STREET",
		prompt:
			"Modern streetwear look, urban setting, candid style, vibrant colors, shallow depth of field, high contrast, cinematic grain.",
		metadata: "02 // REF",
	},
	{
		id: "fashion-avant",
		category: "FASHION",
		label: "AVANT-GARDE",
		prompt:
			"Conceptual avant-garde fashion, surreal silhouette, monochrome palette, harsh shadows, grainy film texture, high fashion photography.",
		metadata: "03 // REF",
	},

	// INTERIOR
	{
		id: "interior-brutalist",
		category: "INTERIOR",
		label: "RAW BRUTALIST",
		prompt:
			"Brutalist interior design, raw concrete walls, minimalist furniture, dramatic natural light from high windows, architectural photography, 35mm film.",
		metadata: "04 // REF",
	},
	{
		id: "interior-bauhaus",
		category: "INTERIOR",
		label: "BAUHAUS SPACE",
		prompt:
			"Bauhaus inspired interior, primary colors accents, geometric furniture, functional minimalist layout, clean lines, diffused daylight.",
		metadata: "05 // REF",
	},
	{
		id: "interior-scandi",
		category: "INTERIOR",
		label: "DARK SCANDI",
		prompt:
			"Nordic minimalist interior, charcoal oak wood, soft fabric textures, warm ambient lighting, peaceful atmosphere, high-end furniture.",
		metadata: "06 // REF",
	},

	// ARCHITECTURE
	{
		id: "arch-minimal",
		category: "ARCHITECTURE",
		label: "GLASS MINIMALISM",
		prompt:
			"Minimalist modern architecture, floor-to-ceiling glass, night view with soft interior lighting, reflection on dark water, clean geometry, Mies van der Rohe style.",
		metadata: "07 // REF",
	},
	{
		id: "arch-brutalist-ext",
		category: "ARCHITECTURE",
		label: "CONCRETE MONOLITH",
		prompt:
			"Massive brutalist concrete building, repetitive geometric patterns, overcast sky properly exposing textures, cinematic wide shot, sharp edges.",
		metadata: "08 // REF",
	},

	// TECH / INDUSTRIAL
	{
		id: "tech-braun",
		category: "TECH",
		label: "RAMS METER",
		prompt:
			"Braun inspired industrial design, matte black finish, mechanical knobs, orange accent light, functionalist aesthetic, studio lighting, macro photography.",
		metadata: "09 // REF",
	},
	{
		id: "tech-minimal",
		category: "TECH",
		label: "DARK CIRCUIT",
		prompt:
			"Minimalist high-tech device, sleek aluminum and glass, subtle UI glow, dark grey environment, precision engineering, high-fidelity render.",
		metadata: "10 // REF",
	},
];
