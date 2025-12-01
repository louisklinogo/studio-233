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

	return (
		<div
			className={cn(
				"pointer-events-auto",
				"flex flex-col gap-[1px]",
				"bg-neutral-200 dark:bg-neutral-800",
				"rounded-sm",
				"min-w-[240px] max-w-xs",
				"border border-transparent dark:border-neutral-800 shadow-sm",
				isOpen ? "z-50" : "z-0",
			)}
		>
			{/* Header & Dropdown Wrapper */}
			<div ref={dropdownRef} className="relative">
				{/* Header / Title Plate (Clickable) */}
				<button
					onClick={() => setIsOpen(!isOpen)}
					className={cn(
						"w-full text-left bg-[#f4f4f0] dark:bg-[#111111] px-4 py-3 flex flex-col gap-0.5 transition-colors",
						"hover:bg-white dark:hover:bg-[#1a1a1a]",
						isOpen && "bg-white dark:bg-[#1a1a1a]",
					)}
				>
					<div className="flex items-center justify-between gap-3 w-full">
						<span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/70 flex items-center gap-1">
							STUDIO+233 / CANVAS
							<ChevronDown
								className={cn(
									"w-3 h-3 transition-transform duration-200",
									isOpen && "rotate-180",
								)}
							/>
						</span>
						{/* Status Indicator - Precision LED look */}
						<div className="flex items-center gap-1.5">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[inset_0_1px_1px_rgba(0,0,0,0.1),0_0_4px_rgba(16,185,129,0.4)]" />
						</div>
					</div>
					<div className="text-sm font-bold text-foreground tracking-tight truncate w-full">
						{title}
					</div>
				</button>

				{/* Dropdown Content */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							className="absolute top-full left-0 right-0 z-50 overflow-hidden bg-[#f4f4f0] dark:bg-[#111111] border-t border-neutral-200 dark:border-neutral-800 shadow-lg rounded-b-sm"
						>
							{mode === "menu" ? (
								<div className="p-2 flex flex-col gap-1">
									<button
										onClick={() => setMode("create")}
										className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm transition-colors w-full text-left"
									>
										<Plus className="w-3.5 h-3.5" />
										New Canvas
									</button>
									<button
										onClick={handleBackToHub}
										className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm transition-colors w-full text-left"
									>
										<LayoutGrid className="w-3.5 h-3.5" />
										Back to Hub
									</button>

									<div className="h-[1px] bg-neutral-200 dark:bg-neutral-800 my-1" />

									<div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
										Recent
									</div>
									{/* Recent Items from DB */}
									<div className="flex flex-col gap-0.5">
										{recentProjects.isLoading ? (
											<div className="px-3 py-2 text-xs text-neutral-400 italic">
												Loading...
											</div>
										) : recentProjects.data?.length === 0 ? (
											<div className="px-3 py-2 text-xs text-neutral-400 italic">
												No recent projects
											</div>
										) : (
											recentProjects.data?.map((proj) => (
												<button
													key={proj.id}
													onClick={() => router.push(`/canvas/${proj.id}`)}
													className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm transition-colors w-full text-left truncate"
												>
													{proj.name}
												</button>
											))
										)}
									</div>
								</div>
							) : (
								<div className="p-3 flex flex-col gap-3">
									<div className="flex items-center justify-between">
										<span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
											Initialize Canvas
										</span>
										<button
											onClick={() => setMode("menu")}
											className="text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
										>
											CANCEL
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
											placeholder="CANVAS_NAME"
											className="w-full bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 px-0 py-1 text-sm font-bold text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-700 focus:ring-0 focus:border-[#FF4D00] transition-colors rounded-none"
										/>
										<button
											type="submit"
											disabled={!newName.trim() || createProject.isPending}
											className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white text-xs font-mono uppercase py-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
										>
											{createProject.isPending ? (
												<>
													<Loader2 className="w-3 h-3 animate-spin" />
													Booting...
												</>
											) : (
												"Initialize"
											)}
										</button>
									</form>
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Technical Specs Plate (Only visible when closed) */}
			{!isOpen && (
				<div className="bg-[#f4f4f0] dark:bg-[#111111] px-4 py-2.5 grid grid-cols-[60px_1fr] gap-y-1 text-[10px] font-mono leading-tight border-t border-transparent dark:border-neutral-800">
					<span className="uppercase text-muted-foreground/60 tracking-wider">
						DIM
					</span>
					<span className="text-foreground text-right tabular-nums tracking-wide">
						{sizeLabel} <span className="text-muted-foreground/40">px</span>
					</span>

					<span className="uppercase text-muted-foreground/60 tracking-wider">
						ASPECT
					</span>
					<span className="text-foreground text-right tabular-nums tracking-wide">
						{aspectLabel}
					</span>

					<span className="uppercase text-muted-foreground/60 tracking-wider">
						LAST MOD
					</span>
					<span className="text-foreground text-right tabular-nums tracking-wide">
						{lastSavedLabel}
					</span>
				</div>
			)}
		</div>
	);
}
