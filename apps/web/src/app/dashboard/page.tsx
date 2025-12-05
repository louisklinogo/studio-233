import { auth } from "@studio233/auth";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
	const headerList = await headers();
	const headerRecord = Object.fromEntries(headerList.entries());
	const session = await auth.api.getSession({ headers: headerRecord });

	// Note: Redirects are handled by layout.tsx, but typesafety needs this check
	if (!session) return null;

	// Fetch User Data, Projects, and Workspaces in parallel
	const user = await prisma.user.findUnique({
		where: { id: session.user.id as string },
		include: {
			workspaces: {
				orderBy: { updatedAt: "desc" },
				include: {
					_count: {
						select: { projects: true },
					},
				},
			},
			projects: {
				take: 50, // Increase limit as we filter client side
				orderBy: { updatedAt: "desc" },
				select: {
					id: true,
					name: true,
					thumbnail: true,
					updatedAt: true,
					description: true,
					workspaceId: true, // Needed for filtering
					type: true,
				},
			},
		},
	});

	if (!user) return null;

	// Auto-create default workspace if none exist (Migration / First Run)
	if (user.workspaces.length === 0) {
		const defaultWorkspace = await prisma.workspace.create({
			data: {
				name: "Main Workspace",
				slug: `main-${Math.random().toString(36).substring(7)}`,
				userId: user.id,
			},
		});
		// Add it to the list for immediate rendering
		user.workspaces = [{ ...defaultWorkspace, _count: { projects: 0 } } as any];

		// Optional: If there are projects with no workspaceId, we might want to attach them here
		// But let's assume valid state for now or handle migration separately
	}

	return (
		<DashboardClient
			userProjects={user.projects}
			userWorkspaces={user.workspaces}
		/>
	);
}
