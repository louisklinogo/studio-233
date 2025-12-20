import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Viewfinder3D } from "@/components/ui/Viewfinder3D";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Suspense fallback={<Viewfinder3D label="CALIBRATING_WORKSPACES" />}>
			<AuthenticatedDashboard>{children}</AuthenticatedDashboard>
		</Suspense>
	);
}

async function AuthenticatedDashboard({
	children,
}: {
	children: React.ReactNode;
}) {
	const headerList = await headers();
	const headerRecord = Object.fromEntries(headerList.entries());
	const session = await getSessionWithRetry(headerRecord);

	if (!session) {
		redirect("/login");
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id as string },
		select: {
			id: true,
			name: true,
			email: true,
			hasCompletedOnboarding: true,
		},
	});

	if (!user) {
		redirect("/login");
	}

	if (!user.hasCompletedOnboarding) {
		redirect("/onboarding");
	}

	return <DashboardShell user={user}>{children}</DashboardShell>;
}
