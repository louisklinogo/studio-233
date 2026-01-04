import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

const rootDir = path.resolve(process.cwd(), "../..");
config({ path: path.join(rootDir, ".env.local"), override: true });
config({ path: path.join(rootDir, ".env"), override: false });

export default defineConfig({
	schema: "./prisma/schema",
	datasource: {
		provider: "postgresql",
		url: process.env.DATABASE_URL || "postgresql://dummy@localhost:5432/dummy",
		directUrl: process.env.DIRECT_DATABASE_URL,
	},
});
