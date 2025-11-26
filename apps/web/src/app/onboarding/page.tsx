import { auth } from "@studio233/auth";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { completeOnboarding } from "@/app/actions/onboarding-actions";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage() {
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

	if (user.hasCompletedOnboarding) {
		redirect("/dashboard");
	}

	return (
		<div className="min-h-screen bg-[#e5e5e5] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 flex items-center justify-center px-6 py-16 relative overflow-hidden">
			{/* Background Grid */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 pointer-events-none" />

			{/* Main Flow Component */}
			<OnboardingFlow
				initialName={user.name || ""}
				userId={user.id}
				action={completeOnboarding}
			/>
		</div>
	);
}
