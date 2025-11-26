import { auth } from "@studio233/auth";
import { prisma } from "@studio233/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
	CreateProjectCard,
	ProjectCard,
} from "@/components/dashboard/ProjectCard";
import { TelemetryBar } from "@/components/dashboard/TelemetryBar";

export default async function DashboardPage() {
	const headerList = await headers();
	const headerRecord = Object.fromEntries(headerList.entries());
	const session = await auth.api.getSession({ headers: headerRecord });

	// Note: Redirects are handled by layout.tsx, but typesafety needs this check
	if (!session) return null;

	const user = await prisma.user.findUnique({
		where: { id: session.user.id as string },
		include: {
			projects: {
				take: 3,
				orderBy: { updatedAt: "desc" },
				select: {
					id: true,
					name: true,
					thumbnail: true,
					updatedAt: true,
				},
			},
		},
	});

	if (!user) return null;

	// Mock Data for now (until billing integration)
	const mockCredits = { used: 124, total: 1000 };
	const mockTier = "PRO_TIER";

	return (
		<div className="space-y-12">
			<header>
				<p className="font-mono text-xs tracking-[0.3em] text-[#FF4D00] mb-2">
					OPERATOR_HUB
				</p>
				<h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white">
					Command Center
				</h1>
			</header>

			<TelemetryBar credits={mockCredits} tier={mockTier} />

			<section className="space-y-6">
				<div className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-900 pb-4">
					<h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
						Active Sessions
					</h2>
					<span className="font-mono text-xs text-neutral-500">
						RECENT_ACCESS
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<CreateProjectCard />
					{user.projects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
					{user.projects.length === 0 && (
						<div className="hidden md:flex items-center justify-center border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/30 p-4 min-h-[160px] col-span-2">
							<p className="font-mono text-xs text-neutral-600 text-center">
								NO_ACTIVE_SESSIONS
								<br />
								INITIALIZE_NEW_CANVAS
							</p>
						</div>
					)}
				</div>
			</section>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Quick Actions / News */}
				<div className="border border-neutral-200 dark:border-neutral-900 p-6 space-y-4 bg-white dark:bg-transparent">
					<h3 className="font-mono text-xs text-neutral-500 tracking-widest uppercase">
						System Messages
					</h3>
					<div className="space-y-4">
						<div className="flex gap-4 items-start">
							<div className="w-1 h-1 bg-[#FF4D00] mt-2" />
							<div>
								<p className="text-sm text-neutral-900 dark:text-neutral-300 font-medium">
									System Updated to v2.4.0
								</p>
								<p className="text-xs text-neutral-500 mt-1">
									New batch processing nodes available in Studio.
								</p>
							</div>
						</div>
						<div className="flex gap-4 items-start">
							<div className="w-1 h-1 bg-neutral-700 mt-2" />
							<div>
								<p className="text-sm text-neutral-900 dark:text-neutral-300 font-medium">
									Maintenance Scheduled
								</p>
								<p className="text-xs text-neutral-500 mt-1">
									Tuesday 04:00 UTC - Minimal downtime expected.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
