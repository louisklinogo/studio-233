import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../prisma/generated/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is not set");
}

const isNeon = /neon\.tech/.test(connectionString);

export interface PrismaResource {
	pool: Pool;
	adapter: PrismaPg;
	client: PrismaClient;
}

const globalForPrisma = globalThis as unknown as {
	prismaResource: PrismaResource | undefined;
};

export function getDatabaseResources(): PrismaResource {
	// If resources already exist, return them
	if (globalForPrisma.prismaResource) {
		return globalForPrisma.prismaResource;
	}

	// Otherwise, create new resources
	const pool = new Pool({
		connectionString,
		ssl:
			isNeon || process.env.PGSSLMODE === "require"
				? { rejectUnauthorized: false }
				: undefined,
		// Pool sizing - lower for serverless, higher for dedicated
		max: process.env.PGPOOL_MAX
			? Number(process.env.PGPOOL_MAX)
			: isNeon
				? 20
				: 10,
		min: 0, // Allow pool to scale down to zero
		// Connection timeouts (critical for serverless DBs that sleep)
		connectionTimeoutMillis: process.env.PGCONNECT_TIMEOUT
			? Number(process.env.PGCONNECT_TIMEOUT)
			: 30_000, // 30s to establish connection
		idleTimeoutMillis: process.env.PGIDLE_TIMEOUT
			? Number(process.env.PGIDLE_TIMEOUT)
			: 30_000, // Close idle connections after 30s
		// Validate connections before use (catches stale connections)
		allowExitOnIdle: true,
	});

	if (process.env.NODE_ENV === "development") {
		pool.on("connect", () => {
			// console.debug("[db] New pool connection established");
		});
		pool.on("error", (err) => {
			console.error("[db] Unexpected error on idle client", err);
		});
	}

	const adapter = new PrismaPg(pool);
	const client = new PrismaClient({
		adapter,
		log:
			process.env.NODE_ENV === "development"
				? ["query", "error", "warn"]
				: ["error"],
	});

	const resource = { pool, adapter, client };

	// Cache in development
	if (process.env.NODE_ENV !== "production") {
		globalForPrisma.prismaResource = resource;
	}

	return resource;
}

export const { prisma, pool } = (() => {
	const { client, pool } = getDatabaseResources();
	return { prisma: client, pool };
})();

export const disconnect = async () => {
	if (globalForPrisma.prismaResource) {
		await globalForPrisma.prismaResource.pool.end();
		await globalForPrisma.prismaResource.client.$disconnect();
		globalForPrisma.prismaResource = undefined;
	}
};

export * from "./batch-store";

export default prisma;
export * from "../prisma/generated/client";
