/** @type {import('next').NextConfig} */
import { withBotId } from "botid/next/config";
import path from "path";

const emptyModuleImport = "./src/lib/empty-module.ts";
const emptyModulePath = path.resolve(process.cwd(), "src/lib/empty-module.ts");

const nextConfig = {
	devIndicators: false,
	cacheComponents: true,
	transpilePackages: [
		"@studio233/ui",
		"@studio233/canvas",
		"@studio233/ai",
		"@studio233/auth",
		"@studio233/api",
		"@studio233/db",
		"@studio233/config",
	],
	turbopack: {
		resolveAlias: {
			canvas: emptyModuleImport,
			encoding: emptyModuleImport,
		},
	},
	webpack: (config) => {
		// Ignore canvas module which is required by Konva in Node environments
		config.resolve.alias.canvas = emptyModulePath;
		config.resolve.alias.encoding = emptyModulePath;

		return config;
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "storage.googleapis.com",
			},
			{
				protocol: "https",
				hostname: "fal.media",
			},
			{
				protocol: "https",
				hostname: "v3.fal.media",
			},
			{
				protocol: "https",
				hostname: "fal.ai",
			},
		],
	},
};

export default withBotId(nextConfig);
