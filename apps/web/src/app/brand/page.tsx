import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BrandClient } from "@/components/dashboard/brand/BrandClient";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const fetchWorkspacesWithRetry = async (userId: string) => {
	return await prisma.workspace.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
	});
};

export default async function BrandPage(props: {
	searchParams: Promise<{ workspaceId?: string }>;
}) {
	const searchParams = await props.searchParams;
	const headerList = await headers();
	const headerRecord = Object.fromEntries(headerList.entries());
	const session = await getSessionWithRetry(headerRecord);

	if (!session) return redirect("/login");

	// Get full user profile for DashboardShell
	const user = await prisma.user.findUnique({
		where: { id: session.user.id as string },
	});

	if (!user) return redirect("/login");

	const workspaces = await fetchWorkspacesWithRetry(session.user.id as string);

	if (workspaces.length === 0) {
		return redirect("/dashboard");
	}

	const selectedWorkspaceId = searchParams.workspaceId || workspaces[0].id;

	return (
		<DashboardShell user={user}>
			<BrandClient workspaceId={selectedWorkspaceId} />
		</DashboardShell>
	);
}
