"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutGrid, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

interface CanvasTitleBlockProps {
	projectId?: string;
	projectName?: string;
	canvasWidth: number;
	canvasHeight: number;
	lastSavedAt?: number | null;
}

export function CanvasTitleBlock({
	projectId,
	projectName,
	canvasWidth,
	canvasHeight,
	lastSavedAt,
}: CanvasTitleBlockProps) {
	const router = useRouter();
	const trpc = useTRPC();
	const recentProjects = useQuery(trpc.project.getRecent.queryOptions());
	const [isOpen, setIsOpen] = React.useState(false);
	const [mode, setMode] = React.useState<"menu" | "create">("menu");
	const [newName, setNewName] = React.useState("");
	const dropdownRef = React.useRef<HTMLDivElement>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		router.prefetch("/dashboard");
	}, [router]);

	const title =
		projectName && projectName.trim().length > 0
			? projectName
			: projectId && projectId !== "undefined" && projectId !== "null"
				? projectId
				: "Untitled Canvas";

	const hasSize = canvasWidth > 0 && canvasHeight > 0;
	const sizeLabel = hasSize ? `${canvasWidth} × ${canvasHeight}` : "—";
	const aspectLabel = hasSize ? (canvasWidth / canvasHeight).toFixed(2) : "—";

	let lastSavedLabel = "—";
	if (lastSavedAt) {
		const d = new Date(lastSavedAt);
		lastSavedLabel = d.toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}

	// Close dropdown when clicking outside
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setMode("menu"); // Reset mode on close
				setNewName("");
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Focus input when entering create mode
	React.useEffect(() => {
		if (mode === "create" && isOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [mode, isOpen]);

	const createProject = useMutation({
		...trpc.project.create.mutationOptions(),
		onSuccess: (project) => {
			toast.success("Canvas initialized");
			router.push(`/canvas/${project.id}`);
			setIsOpen(false);
			setMode("menu");
			setNewName("");
		},
		onError: (error) => {
			console.error("Failed to create project:", error);
			toast.error("Failed to initialize canvas");
		},
	});

	const handleCreateSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!newName.trim()) return;
		createProject.mutate({
			name: newName,
			description: "Created via Canvas Studio",
		});
	};

	const handleBackToHub = () => {
		router.push("/dashboard");
	};

	const [activeTab, setActiveTab] = React.useState<"ops" | "log">("ops");

	return (
		<div
			className={cn(
				"pointer-events-auto",
				"flex flex-col gap-[1px]",
				"bg-neutral-200 dark:bg-neutral-800",
				"rounded-sm shadow-sm",
				"min-w-[240px] max-w-xs",
				isOpen ? "z-50" : "z-0",
			)}
		>
			{/* Header */}
			<div ref={dropdownRef} className="relative">
				<button
					onClick={() => setIsOpen(!isOpen)}
					className={cn(
						"w-full text-left bg-[#f4f4f0] dark:bg-[#0a0a0a] px-6 py-5 flex items-center justify-between group transition-colors",
						isOpen && "bg-white dark:bg-[#111]",
					)}
				>
					<div className="flex flex-col gap-1 overflow-hidden">
						<span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#FF4D00] flex items-center gap-2">
							CANVAS_IDENTITY
						</span>
						<div className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
							<span className="truncate">{title}</span>
							<ChevronDown
								className={cn(
									"w-3 h-3 text-neutral-400 transition-transform duration-300",
									isOpen && "rotate-180",
								)}
							/>
						</div>
					</div>
					<div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
				</button>

				{/* Tabbed Dropdown Content */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
							className="overflow-hidden bg-[#f4f4f0] dark:bg-[#0a0a0a] border-t border-neutral-200 dark:border-neutral-800"
						>
							{/* Tab Switcher */}
							<div className="flex bg-neutral-100 dark:bg-[#050505] p-1 gap-1">
								<button
									onClick={() => {
										setActiveTab("ops");
										setMode("menu");
									}}
									className={cn(
										"flex-1 py-2 text-[9px] font-mono uppercase tracking-widest transition-colors",
										activeTab === "ops"
											? "bg-white dark:bg-[#111] text-[#FF4D00] shadow-sm"
											: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200",
									)}
								>
									OPS
								</button>
								<button
									onClick={() => setActiveTab("log")}
									className={cn(
										"flex-1 py-2 text-[9px] font-mono uppercase tracking-widest transition-colors",
										activeTab === "log"
											? "bg-white dark:bg-[#111] text-[#FF4D00] shadow-sm"
											: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200",
									)}
								>
									LOG
								</button>
							</div>

							<div className="px-6 py-6 min-h-[160px]">
								{activeTab === "ops" ? (
									/* Operations Tab */
									mode === "menu" ? (
										<div className="flex flex-col gap-2">
											<button
												onClick={() => setMode("create")}
												className="flex items-center justify-between p-3 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 hover:border-[#FF4D00] transition-colors group"
											>
												<span className="text-xs font-medium text-neutral-900 dark:text-white">
													Initialize Canvas
												</span>
												<Plus
													className="text-neutral-400 group-hover:text-[#FF4D00] transition-colors"
													size={12}
												/>
											</button>
											<button
												onClick={handleBackToHub}
												className="flex items-center justify-between p-3 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 transition-colors group"
											>
												<span className="text-xs font-medium text-neutral-900 dark:text-white">
													Return to Hub
												</span>
												<LayoutGrid
													className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
													size={12}
												/>
											</button>
										</div>
									) : (
										/* Create Mode */
										<div className="flex flex-col gap-4">
											<div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
												<span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
													Manifest_Init
												</span>
												<button
													onClick={() => setMode("menu")}
													className="text-[9px] font-mono text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
												>
													[ BACK ]
												</button>
											</div>
											<form
												onSubmit={handleCreateSubmit}
												className="flex flex-col gap-3"
											>
												<input
													ref={inputRef}
													value={newName}
													onChange={(e) => setNewName(e.target.value)}
													placeholder="CANVAS_IDENTIFIER"
													className="w-full bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 px-0 py-2 text-sm font-bold text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-800 focus:ring-0 focus:border-[#FF4D00] transition-colors rounded-none"
												/>
												<button
													type="submit"
													disabled={!newName.trim() || createProject.isPending}
													className="w-full bg-[#1a1a1a] dark:bg-[#111] border border-neutral-800 text-white hover:border-[#FF4D00] text-[10px] font-mono uppercase py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
												>
													{createProject.isPending ? (
														<>
															<Loader2 className="w-3 h-3 animate-spin" />
															Booting...
														</>
													) : (
														"Open Entry"
													)}
												</button>
											</form>
										</div>
									)
								) : (
									/* History Log Tab */
									<div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
										{recentProjects.isLoading ? (
											<div className="px-3 py-2 text-xs text-neutral-400 italic font-mono">
												Linking...
											</div>
										) : recentProjects.data?.length === 0 ? (
											<div className="px-3 py-2 text-xs text-neutral-400 italic font-mono">
												No records
											</div>
										) : (
											recentProjects.data?.map((proj) => (
												<button
													key={proj.id}
													onClick={() => router.push(`/canvas/${proj.id}`)}
													className="group flex items-center justify-between p-2 hover:bg-neutral-100 dark:hover:bg-[#151515] transition-colors"
												>
													<span className="text-xs text-neutral-600 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors truncate pr-4">
														{proj.name}
													</span>
													<div className="flex items-center gap-2 shrink-0">
														<span className="text-[9px] font-mono text-neutral-400 tabular-nums">
															{proj.updatedAt
																? new Date(proj.updatedAt).toLocaleTimeString(
																		[],
																		{
																			hour: "2-digit",
																			minute: "2-digit",
																			hour12: false,
																		},
																	)
																: "—"}
														</span>
														<div className="w-1.5 h-1.5 rounded-full bg-[#FF4D00]/40 group-hover:bg-[#FF4D00]" />
													</div>
												</button>
											))
										)}
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Technical Specs Plate */}
			{!isOpen && (
				<div className="bg-[#f4f4f0] dark:bg-[#0a0a0a] px-6 py-3 grid grid-cols-[60px_1fr] gap-y-1 text-[10px] font-mono leading-tight border-t border-neutral-200 dark:border-neutral-800">
					<span className="uppercase text-neutral-400 tracking-wider">DIM</span>
					<span className="text-neutral-900 dark:text-neutral-400 text-right tabular-nums tracking-wide">
						{sizeLabel} <span className="text-neutral-400/40">px</span>
					</span>
					<span className="uppercase text-neutral-400 tracking-wider">
						ASPECT
					</span>
					<span className="text-neutral-900 dark:text-neutral-400 text-right tabular-nums tracking-wide">
						{aspectLabel}
					</span>
					<span className="uppercase text-neutral-400 tracking-wider">
						LAST MOD
					</span>
					<span className="text-neutral-900 dark:text-neutral-400 text-right tabular-nums tracking-wide">
						{lastSavedLabel}
					</span>
				</div>
			)}
		</div>
	);
}
