import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const isNeon = /neon\.tech/.test(connectionString);

const pool = new Pool({
    connectionString,
    ssl: isNeon || process.env.PGSSLMODE === 'require'
        ? { rejectUnauthorized: false }
        : undefined,
    max: process.env.PGPOOL_MAX ? Number(process.env.PGPOOL_MAX) : undefined,
});
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
export * from "../prisma/generated/client";
