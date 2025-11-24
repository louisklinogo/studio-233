import {
	Carlito,
	JetBrains_Mono,
	Outfit,
	Poppins,
	Space_Grotesk,
} from "next/font/google";

// Primary Sans - Technical, Clean, Modern (Replaced Inter with Carlito/Calibri)
export const carlito = Carlito({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-calibri",
	display: "swap",
});

// Headings/Labels - Prominent, Friendly
export const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-poppins",
	display: "swap",
});

// UI/Dropzones - Clean, Display
export const outfit = Outfit({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-outfit",
	display: "swap",
});

// Brand/Heading - Characterful, Brutalist
export const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space",
	display: "swap",
});

// Monospace - Data, Code
export const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains",
	display: "swap",
});

// Re-export for backward compatibility if needed, or update consumers
export const focal = carlito; // Aliasing focal to carlito (Calibri replacement)
export const hal = spaceGrotesk; // Aliasing hal to spaceGrotesk
export const halMono = jetbrainsMono; // Aliasing halMono to jetbrainsMono
export const commitMono = jetbrainsMono; // Aliasing commitMono to jetbrainsMono
export const inconsolata = jetbrainsMono; // Aliasing inconsolata to jetbrainsMono
