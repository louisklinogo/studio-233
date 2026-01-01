import { prisma } from "../packages/db/src/index";

async function inspect() {
	console.log("Prisma client models:");
	const keys = Object.keys(prisma);
	const models = keys.filter((k) => !k.startsWith("$") && !k.startsWith("_"));
	console.log(models);
}

inspect();
