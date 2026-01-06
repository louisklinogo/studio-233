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

	// 1. Perform atomic update and initialization
	const result = await prisma.$transaction(async (tx) => {
		// Update User & Settings
		const updatedUser = await tx.user.update({
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

		// Ensure Workspace Exists
		let workspace = await tx.workspace.findFirst({
			where: { userId },
		});

		if (!workspace) {
			workspace = await tx.workspace.create({
				data: {
					name: "Main Workspace",
					slug: `main-${Math.random().toString(36).substring(7)}`,
					userId,
				},
			});
		}

		// Create First Project from Blueprint
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

			const newProject = await tx.project.create({
				data: {
					name: projectName,
					description: projectDescription,
					type: projectType,
					workspaceId: workspace.id,
					userId,
				},
			});

			// CRITICAL: Ensure parity with tRPC create - create the Canvas record
			if (projectType === "CANVAS") {
				await tx.canvas.create({
					data: {
						name: "Main Canvas",
						projectId: newProject.id,
						data: {},
					},
				});
			}

			// Create a default workflow definition for STUDIO projects
			if (projectType === "STUDIO") {
				await tx.workflowDefinition.create({
					data: {
						name: "Main Workflow",
						description: "",
						projectId: newProject.id,
						userId,
						nodes: [],
						edges: [],
					},
				});
			}
		}

		return updatedUser;
	});

	redirect("/dashboard");
}
