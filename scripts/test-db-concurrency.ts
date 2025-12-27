import { prisma as db } from "../packages/db/src/index";

async function runTask(id: number) {
	// console.log(`Task ${id} starting...`);
	const start = Date.now();
	try {
		await db.agentThread.count();
		// console.log(`Task ${id} completed in ${Date.now() - start}ms`);
	} catch (e) {
		console.error(`Task ${id} FAILED:`, e.message);
	}
}

const CONCURRENCY = 50;
console.log(`Starting concurrency test (${CONCURRENCY} tasks)...`);
const start = Date.now();
const tasks = Array.from({ length: CONCURRENCY }, (_, i) => runTask(i));
await Promise.all(tasks);
console.log(`All tasks completed in ${Date.now() - start}ms.`);

process.exit(0);
