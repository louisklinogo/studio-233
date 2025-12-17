"use server";

import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
	const headerList = await headers();
	const headerRecord = Object.fromEntries(headerList.entries());
	const session = await getSessionWithRetry(headerRecord);

	if (!session) {
		redirect("/login");
	}

	const userId = session.user.id as string;
	const name = formData.get("name") as string;
	const mode = formData.get("mode") as string;

	// 1. Update User & Settings
	await prisma.user.update({
		where: { id: userId },
		data: {
			hasCompletedOnboarding: true,
			name: name || undefined,
			settings: {
				upsert: {
					create: { defaultMode: mode },
					update: { defaultMode: mode },
				},
			},
		},
	});

	// 2. Ensure Workspace Exists
	let workspace = await prisma.workspace.findFirst({
		where: { userId },
	});

	if (!workspace) {
		workspace = await prisma.workspace.create({
			data: {
				name: "Main Workspace",
				slug: `main-${Math.random().toString(36).substring(7)}`,
				userId,
			},
		});
	}

	// 3. Create First Project from Blueprint
	if (mode) {
		let projectName = "Untitled Project";
		let projectDescription = "";
		let projectType: "CANVAS" | "STUDIO" = "CANVAS";

		if (mode === "CANVAS") {
			projectName = "Creative Canvas 01";
			projectDescription = "My first visual exploration.";
			projectType = "CANVAS";
		} else if (mode === "CAMPAIGN") {
			projectName = "Campaign Pipeline 01";
			projectDescription = "Automated asset generation flow.";
			projectType = "STUDIO";
		} else if (mode === "BATCH") {
			projectName = "Batch Processor 01";
			projectDescription = "High-volume data processing.";
			projectType = "STUDIO";
		}

		await prisma.project.create({
			data: {
				name: projectName,
				description: projectDescription,
				type: projectType,
				workspaceId: workspace.id,
				userId,
			},
		});
	}

	redirect("/dashboard");
}
