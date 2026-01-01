import { prisma } from "../packages/db/src/index";

async function checkIntegrity() {
	console.log("--- Database Integrity Check: Projects ---");

	try {
		const totalProjects = await prisma.project.count();
		console.log(`Total Projects: ${totalProjects}`);

		const types = await prisma.project.groupBy({
			by: ["type"],
			_count: {
				id: true,
			},
		});

		console.log("Project distributions:");
		types.forEach((t) => {
			console.log(`- ${t.type || "NULL"}: ${t._count.id}`);
		});

		const nullProjects =
			await prisma.$queryRaw`SELECT count(*) as count FROM project WHERE type IS NULL`;
		console.log(`Raw SQL NULL check: ${(nullProjects as any)[0].count}`);
	} catch (error) {
		console.error("Error checking integrity:", error);
	} finally {
		await prisma.$disconnect();
	}
}

checkIntegrity();
