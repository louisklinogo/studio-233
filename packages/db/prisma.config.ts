import { config } from "dotenv";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

const rootDir = path.resolve(process.cwd(), "../..");
config({ path: path.join(rootDir, ".env.local"), override: true });
config({ path: path.join(rootDir, ".env"), override: false });

export default defineConfig({
	schema: "./prisma/schema",
	datasource: {
		provider: "postgresql",
		url: env("DATABASE_URL"),
		directUrl: env("DIRECT_DATABASE_URL"),
	},
});
