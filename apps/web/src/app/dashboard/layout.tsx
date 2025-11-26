import { auth } from "@studio233/auth";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
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
