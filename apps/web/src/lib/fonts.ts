import {
	IBM_Plex_Sans,
	JetBrains_Mono,
	Outfit,
	Poppins,
} from "next/font/google";
import localFont from "next/font/local";

// IBM Plex Sans - The "Industrial/Braun" Choice
export const ibmPlexSans = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-ibm-plex",
	display: "swap",
});

// Primary Sans - Satoshi (Replaces Carlito/Inter) - "Swiss/Modern"
export const satoshi = localFont({
	variable: "--font-satoshi",
	display: "swap",
	adjustFontFallback: false,
	src: [
		{
			path: "../../public/fonts/Satoshi_Complete/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2",
			style: "normal",
			weight: "300 900",
		},
	],
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
	variable: "--font-outfit",
	display: "swap",
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

// Cabinet Grotesk - The New "Swiss Red" Choice
export const cabinetGrotesk = localFont({
	variable: "--font-cabinet",
	display: "swap",
	adjustFontFallback: false,
	src: [
		{
			path: "../../public/fonts/CabinetGrotesk_Complete/CabinetGrotesk_Complete/Fonts/WEB/fonts/CabinetGrotesk-Variable.woff2",
			style: "normal",
			weight: "100 900",
		},
	],
});

// Monospace - Data, Code
export const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains",
	display: "swap",
});

// Re-exports / Aliases
export const focal = ibmPlexSans; // Aliasing focal to ibmPlexSans (Industrial choice)
export const hal = spaceGrotesk; // Aliasing hal to spaceGrotesk
export const halMono = jetbrainsMono; // Aliasing halMono to jetbrainsMono
export const commitMono = jetbrainsMono; // Aliasing commitMono to jetbrainsMono
export const inconsolata = jetbrainsMono; // Aliasing inconsolata to jetbrainsMono
