import localFont from "next/font/local";

// Primary Sans - Technical, Clean, Modern (Replaced Inter with Carlito/Calibri)
export const carlito = localFont({
	variable: "--font-calibri",
	display: "swap",
	adjustFontFallback: false,
	src: [
		{
			path: "../../public/fonts/fonts/carlito-regular.woff2",
			style: "normal",
			weight: "400",
		},
		{
			path: "../../public/fonts/fonts/carlito-bold.woff2",
			style: "normal",
			weight: "700",
		},
	],
});

// Headings/Labels - Prominent, Friendly
export const poppins = localFont({
	variable: "--font-poppins",
	display: "swap",
	adjustFontFallback: false,
	src: [
		{
			path: "../../public/fonts/fonts/poppins-regular.woff2",
			style: "normal",
			weight: "400",
		},
		{
			path: "../../public/fonts/fonts/poppins-medium.woff2",
			style: "normal",
			weight: "500",
		},
		{
			path: "../../public/fonts/fonts/poppins-semibold.woff2",
			style: "normal",
			weight: "600",
		},
		{
			path: "../../public/fonts/fonts/poppins-bold.woff2",
			style: "normal",
			weight: "700",
		},
	],
});

// UI/Dropzones - Clean, Display
export const outfit = localFont({
	variable: "--font-outfit",
	display: "swap",
	adjustFontFallback: false,
	src: [
		{
			path: "../../public/fonts/fonts/outfit-variable.woff2",
			style: "normal",
			weight: "400 700",
		},
	],
});

// Brand/Heading - Characterful, Brutalist
export const spaceGrotesk = localFont({
	variable: "--font-space",
	display: "swap",
	adjustFontFallback: false,
	src: [
		{
			path: "../../public/fonts/fonts/space-grotesk-variable.woff2",
			style: "normal",
			weight: "300 700",
		},
	],
});

// Monospace - Data, Code
export const jetbrainsMono = localFont({
	variable: "--font-jetbrains",
	display: "swap",
	adjustFontFallback: false,
	src: [
		{
			path: "../../public/fonts/fonts/jetbrains-mono-variable.woff2",
			style: "normal",
			weight: "100 800",
		},
	],
});

// Re-export for backward compatibility if needed, or update consumers
export const focal = carlito; // Aliasing focal to carlito (Calibri replacement)
export const hal = spaceGrotesk; // Aliasing hal to spaceGrotesk
export const halMono = jetbrainsMono; // Aliasing halMono to jetbrainsMono
export const commitMono = jetbrainsMono; // Aliasing commitMono to jetbrainsMono
export const inconsolata = jetbrainsMono; // Aliasing inconsolata to jetbrainsMono
