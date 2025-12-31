"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
	CreateProjectCard,
	ProjectCard,
} from "@/components/dashboard/ProjectCard";
import { TelemetryBar } from "@/components/dashboard/TelemetryBar";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import { BrandPanel } from "@/components/studio/brand/BrandPanel";
import { SwissIcons } from "@/components/ui/SwissIcons";

interface DashboardClientProps {
	userProjects: any[]; // Using any for now to match what is passed from server, ideally should be typed
	userWorkspaces: any[];
}

export function DashboardClient({
	userProjects,
	userWorkspaces,
}: DashboardClientProps) {
	const searchParams = useSearchParams();
	const filterType = searchParams.get("type"); // "CANVAS" | "STUDIO" | "BRAND"

	// Initialize with the first workspace as default if available
	const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(
		userWorkspaces.length > 0 ? userWorkspaces[0].id : "",
	);

	// Sync state if workspaces load later or change (though this is initial data)
	useEffect(() => {
		if (!selectedWorkspaceId && userWorkspaces.length > 0) {
			setSelectedWorkspaceId(userWorkspaces[0].id);
		}
	}, [userWorkspaces, selectedWorkspaceId]);

	// Filter projects by selected workspace and type
	const filteredProjects = useMemo(() => {
		if (!selectedWorkspaceId) return [];
		return userProjects.filter((p) => {
			const matchesWorkspace = p.workspaceId === selectedWorkspaceId;
			const matchesType =
				filterType && filterType !== "BRAND" ? p.type === filterType : true;
			return matchesWorkspace && matchesType;
		});
	}, [userProjects, selectedWorkspaceId, filterType]);

	const selectedWorkspace = userWorkspaces.find(
		(w) => w.id === selectedWorkspaceId,
	);

	// Mock Data
	const mockCredits = { used: 124, total: 1000 };
	const mockTier = "PRO_TIER";

	return (
		<div className="space-y-12">
			<header className="flex items-end justify-between">
				<div className="space-y-1">
					<p className="font-mono text-xs tracking-[0.3em] text-[#FF4D00] mb-2">
						OPERATOR_HUB
					</p>
					{/* Replaced Static Title with Workspace Switcher */}
					<WorkspaceSwitcher
						workspaces={userWorkspaces}
						selectedWorkspaceId={selectedWorkspaceId}
						onSelectWorkspace={setSelectedWorkspaceId}
					/>
				</div>

				{/* Right side stats or timestamp could go here */}
				<div className="hidden md:block font-mono text-xs text-neutral-400 uppercase tracking-widest">
					SYS_READY // {filterType || "ALL_SECTORS"}
				</div>
			</header>

			<TelemetryBar credits={mockCredits} tier={mockTier} />

			{selectedWorkspaceId ? (
				<section className="space-y-6">
					<div className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-900 pb-4">
						<h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight uppercase">
							{filterType
								? `${filterType === "STUDIO" ? "Studio+" : "Canvas"} Sessions`
								: "Active Sessions"}
						</h2>
						<span className="font-mono text-xs text-neutral-500">
							{selectedWorkspace?.name.toUpperCase() || "UNKNOWN"}_CONTEXT
							{filterType && ` // ${filterType}`}
						</span>
					</div>

					{filterType === "BRAND" ? (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
							{/* Large Industrial CTA to Brand Page */}
							<a
								href={`/brand?workspaceId=${selectedWorkspaceId}`}
								className="group relative col-span-1 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111] p-10 rounded-sm space-y-8 hover:border-[#FF4D00] transition-all flex flex-col justify-between min-h-[400px]"
							>
								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-[#FF4D00]" />
										<span className="font-mono text-xs tracking-[0.3em] text-[#FF4D00] font-bold">
											SYSTEM_BRAND_DNA
										</span>
									</div>
									<h3 className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tighter uppercase leading-none">
										Configure <br /> Brand Archive
									</h3>
									<p className="font-mono text-xs text-neutral-500 uppercase leading-relaxed max-w-sm">
										Manage typographic constraints, color palettes, and logo
										marks to ensure absolute stylistic fidelity across all
										production nodes.
									</p>
								</div>
								<div className="flex items-center gap-4 group-hover:gap-6 transition-all">
									<span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white">
										Initialize_Interface
									</span>
									<SwissIcons.ArrowRight className="text-[#FF4D00]" size={20} />
								</div>

								{/* Grid Decoration */}
								<div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
									<div className="grid grid-cols-4 grid-rows-4 h-full w-full">
										{Array.from({ length: 16 }).map((_, i) => (
											<div key={i} className="border border-current" />
										))}
									</div>
								</div>
							</a>

							<div className="space-y-4">
								<div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5 rounded-sm space-y-4">
									<span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
										Global_Alignment_Nodes
									</span>
									<div className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
										ACTIVE_SYNCHRONIZATION
									</div>
									<p className="text-[10px] font-mono text-neutral-500 uppercase">
										Your brand profile is automatically indexed into the RAG
										engine for all creative generation requests.
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111] rounded-sm space-y-2">
										<span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
											Context_Assets
										</span>
										<div className="text-2xl font-bold text-neutral-900 dark:text-white">
											LINKED
										</div>
									</div>
									<div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111] rounded-sm space-y-2">
										<span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
											Refinery_State
										</span>
										<div className="text-2xl font-bold text-[#FF4D00]">
											STABLE
										</div>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{filteredProjects.map((project) => (
								<ProjectCard key={project.id} project={project} />
							))}

							<CreateProjectCard workspaceId={selectedWorkspaceId} />

							{filteredProjects.length === 0 && (
								<div className="hidden md:flex items-center justify-center border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/30 p-4 min-h-[160px] col-span-2">
									<p className="font-mono text-xs text-neutral-600 text-center">
										NO_ACTIVE_SESSIONS_IN_SECTOR
										<br />
										INITIALIZE_NEW_CANVAS
									</p>
								</div>
							)}
						</div>
					)}
				</section>
			) : (
				<div className="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-800 rounded-lg">
					<p className="text-neutral-500 font-mono text-sm mb-4">
						NO WORKSPACE FOUND
					</p>
					<p className="text-xs text-neutral-600 max-w-md text-center">
						Please create a workspace to begin operations.
					</p>
					{/* The switch allows creating one, so this state shouldn't persist long */}
				</div>
			)}

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
