import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

const RETRY_DELAYS_MS = [0, 200, 600] as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientPrismaNetworkError = (error: unknown) => {
	if (!(error instanceof Error)) return false;
	const message = error.message ?? "";
	return (
		message.includes("EAI_AGAIN") ||
		message.includes("ETIMEDOUT") ||
		message.includes("getaddrinfo") ||
		message.includes("ECONNRESET")
	);
};

const fetchUserWithRetry = async (userId: string) => {
	let lastError: unknown;

	for (const delay of RETRY_DELAYS_MS) {
		if (delay > 0) await wait(delay);

		try {
			return await prisma.user.findUnique({
				where: { id: userId },
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
						take: 50,
						orderBy: { updatedAt: "desc" },
						select: {
							id: true,
							name: true,
							thumbnail: true,
							updatedAt: true,
							description: true,
							workspaceId: true,
							type: true,
						},
					},
				},
			});
		} catch (error) {
			lastError = error;
			if (!isTransientPrismaNetworkError(error)) throw error;
		}
	}

	throw lastError ?? new Error("Failed to fetch user after retries");
};

export default async function DashboardPage() {
	const headerList = await headers();
	const headerRecord = Object.fromEntries(headerList.entries());
	const session = await getSessionWithRetry(headerRecord);

	// Note: Redirects are handled by layout.tsx, but typesafety needs this check
	if (!session) return null;

	const user = await fetchUserWithRetry(session.user.id as string);

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
