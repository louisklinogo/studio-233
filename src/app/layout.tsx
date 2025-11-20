import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { BotIdClient } from "botid/client";
import { carlito, outfit, poppins } from "@/lib/fonts";
import { CoreProviders } from "./core-providers";

const defaultAppUrl =
	process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
	title: {
		default: "studio+233 - AI Creative Studio",
		template: "%s | studio+233",
	},
	description:
		"Transform your photos with AI-powered style transfer in seconds. Choose from LoRA models and prompt-based styles including anime, oil painting, cyberpunk, and more.",
	keywords: [
		"AI image editing",
		"image transformation",
		"flux model",
		"LoRA",
		"AI art",
		"LoRA",
		"photo styling",
		"artificial intelligence",
		"machine learning",
		"image generation",
	],
	authors: [{ name: "fal.ai" }],
	creator: "LoRA",
	publisher: "LoRA",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(defaultAppUrl),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		title: "studio+233 - AI Creative Studio",
		description:
			"Transform your photos with AI-powered tools in seconds. Choose from advanced models and prompt-based generation.",
		siteName: "studio+233",
		images: [
			{
				url: "/og-img-compress.png",
				width: 1200,
				height: 630,
				alt: "studio+233 - AI Style Transfer Demo",
				type: "image/png",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "studio+233 - AI Creative Studio",
		description:
			"Transform your photos with AI-powered tools in seconds. Choose from advanced models and prompt-based generation.",
		creator: "@studio_233",
		site: "@studio_233",
		images: [
			{
				url: "/og-img-compress.png",
				width: 1200,
				height: 630,
				alt: "studio+233 - AI Style Transfer Demo",
				type: "image/png",
			},
		],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="antialiased" suppressHydrationWarning>
			<head>
				<meta name="color-scheme" content="dark" />
				<BotIdClient
					protect={[
						{
							path: "/api/trpc/*",
							method: "POST",
						},
						{
							path: "/api/fal",
							method: "POST",
						},
					]}
				/>
			</head>
			<body
				className={`${carlito.variable} ${poppins.variable} ${outfit.variable} font-sans bg-background text-foreground min-h-screen`}
			>
				<CoreProviders>{children}</CoreProviders>
			</body>
			<Analytics />
		</html>
	);
}
