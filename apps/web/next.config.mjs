/** @type {import('next').NextConfig} */
import { withBotId } from "botid/next/config";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;
// Revert to native path separators
const monorepoRoot = path.resolve(projectRoot, "../..");
const emptyModuleImport = "./src/lib/empty-module.ts";
const emptyModulePath = path.resolve(projectRoot, "src/lib/empty-module.ts");
const require = createRequire(import.meta.url);
const nextFontLocalTarget = require.resolve("next/font/local/target.css");

console.log(" [INFO] Monorepo Root:", monorepoRoot);

const nextConfig = {
	devIndicators: false,
	cacheComponents: true,
	outputFileTracingRoot: monorepoRoot,
	serverExternalPackages: ["sharp", "playwright-core"],
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
		root: monorepoRoot,
		resolveAlias: {
			canvas: emptyModuleImport,
			encoding: emptyModuleImport,
			"next/font/local/target.css": nextFontLocalTarget,
		},
	},
	webpack: (config) => {
		// Ignore canvas module which is required by Konva in Node environments
		config.resolve.alias.canvas = emptyModulePath;
		config.resolve.alias.encoding = emptyModulePath;
		config.resolve.alias["next/font/local/target.css"] = nextFontLocalTarget;

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

// Only enable BotId on Vercel deployments to execute headers correctly
const isVercel = process.env.VERCEL === "1";
export default isVercel ? withBotId(nextConfig) : nextConfig;
