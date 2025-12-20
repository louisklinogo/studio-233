import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
	const headerList = await headers();
	const headerRecord = Object.fromEntries(headerList.entries());
	const session = await getSessionWithRetry(headerRecord);

	if (!session) return redirect("/login");

	// Get full user profile
	const user = await prisma.user.findUnique({
		where: { id: session.user.id as string },
	});

	if (!user) return redirect("/login");

	return (
		<DashboardShell user={user}>
			<SettingsClient user={user} />
		</DashboardShell>
	);
}
