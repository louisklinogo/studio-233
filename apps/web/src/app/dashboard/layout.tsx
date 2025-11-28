import { auth } from "@studio233/auth";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-[#050505]">
					<div className="h-4 w-4 animate-pulse bg-neutral-400" />
				</div>
			}
		>
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
	const session = await auth.api.getSession({ headers: headerRecord });

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
