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
		default: "Studio+233 | The AI-Native Creative Suite for Professionals",
		template: "%s | Studio+233",
	},
	description:
		"The AI-native creative suite for high-volume production. Infinite canvas for generation and editing, plus industrial-grade batch processing pipelines.",
	keywords: [
		"batch image processing",
		"AI creative workflow",
		"infinite canvas editor",
		"automated design pipeline",
		"commercial AI tools",
		"AI image editing",
		"image transformation",
		"flux model",
		"LoRA",
		"AI art",
	],
	authors: [{ name: "Studio+233 Systems" }],
	creator: "Studio+233",
	publisher: "Studio+233",
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
		title: "Studio+233 | The AI-Native Creative Suite",
		description:
			"Infinite canvas. Agentic intelligence. Your creative engine for high-volume production.",
		siteName: "Studio+233",
		images: [
			{
				url: "/og-img-compress.png",
				width: 1200,
				height: 630,
				alt: "Studio+233 - AI Creative Suite",
				type: "image/png",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Studio+233 | The AI-Native Creative Suite",
		description:
			"Infinite canvas. Agentic intelligence. Your creative engine for high-volume production.",
		creator: "@studio_233",
		site: "@studio_233",
		images: [
			{
				url: "/og-img-compress.png",
				width: 1200,
				height: 630,
				alt: "Studio+233 - AI Creative Suite",
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
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "Studio+233",
		applicationCategory: "DesignApplication",
		operatingSystem: "Web",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		featureList: [
			"Infinite AI Canvas",
			"Batch Image Processing",
			"Video Generation",
			"Object Isolation",
			"AI Style Transfer",
		],
	};

	return (
		<html lang="en" className="antialiased" suppressHydrationWarning>
			<head>
				<meta name="color-scheme" content="dark" />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
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
