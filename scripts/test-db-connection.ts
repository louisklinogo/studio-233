import { prisma } from "../packages/db/src/index";

async function test() {
	console.log("Testing database connection...");
	try {
		const start = Date.now();
		const result = await prisma.$queryRaw`SELECT 1 as test`;
		console.log("Database connection successful:", result);
		console.log(`Time taken: ${Date.now() - start}ms`);
	} catch (error) {
		console.error("Database connection failed:");
		console.error(error);
	} finally {
		await prisma.$disconnect();
	}
}

test();
