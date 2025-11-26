"use client";

import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { useTRPC } from "@/trpc/client";
import { BraunDialog } from "./BraunDialog";

interface ProjectCardProps {
	project: {
		id: string;
		name: string;
		description?: string | null;
		updatedAt: Date;
		thumbnail: string | null;
	};
}

export function ProjectCard({ project }: ProjectCardProps) {
	const router = useRouter();
	const trpc = useTRPC();
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [actionStatus, setActionStatus] = useState<
		"idle" | "deleting" | "duplicating" | "updating"
	>("idle");
	const [isRemoved, setIsRemoved] = useState(false);

	const updateProject = useMutation({
		...trpc.project.update.mutationOptions(),
		onMutate: () => setActionStatus("updating"),
		onSuccess: () => {
			toast.success("System updated");
			setIsEditOpen(false);
			router.refresh();
			setActionStatus("idle");
		},
		onError: (error) => {
			toast.error("Failed to update system");
			console.error(error);
			setActionStatus("idle");
		},
	});

	const duplicateProject = useMutation({
		...trpc.project.duplicate.mutationOptions(),
		onMutate: () => setActionStatus("duplicating"),
		onSuccess: () => {
			toast.success("System replicated");
			router.refresh();
			setActionStatus("idle");
		},
		onError: (error) => {
			toast.error("Failed to replicate system");
			console.error(error);
			setActionStatus("idle");
		},
	});

	const deleteProject = useMutation({
		...trpc.project.delete.mutationOptions(),
		onMutate: () => {
			setActionStatus("deleting");
			setIsRemoved(true);
		},
		onSuccess: () => {
			toast.success("System purged");
			router.refresh();
		},
		onError: (error) => {
			toast.error("Failed to purge system");
			console.error(error);
			setIsRemoved(false);
		},
		onSettled: () => {
			setActionStatus("idle");
		},
	});

	return (
		<>
			<AnimatePresence initial={false} mode="popLayout">
				{!isRemoved && (
					<motion.div
						key={project.id}
						layout
						initial={{ opacity: 1, scale: 1 }}
						animate={
							actionStatus === "deleting"
								? {
										opacity: 0,
										scale: 0.95,
										filter: "grayscale(100%) brightness(0.5)",
									}
								: {
										opacity: 1,
										scale: 1,
										filter: "grayscale(0%) brightness(1)",
									}
						}
						exit={{
							opacity: 0,
							scale: 0.9,
							filter: "grayscale(100%) brightness(0.5)",
						}}
						transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
						className="group relative flex flex-col h-[280px] bg-[#F5F5F5] dark:bg-[#1E1E1E] border border-transparent hover:border-[#FF4D00] transition-colors duration-200 rounded-sm overflow-hidden"
					>
						{/* Status Overlays */}
						<AnimatePresence>
							{actionStatus === "duplicating" && (
								<motion.div
									initial={{ top: "-10%" }}
									animate={{ top: "110%" }}
									transition={{
										duration: 1.5,
										repeat: Infinity,
										ease: "linear",
									}}
									className="absolute left-0 right-0 h-[2px] bg-[#FF4D00]/50 z-20 shadow-[0_0_15px_#FF4D00] pointer-events-none"
								/>
							)}
							{actionStatus === "deleting" && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="absolute inset-0 bg-red-500/10 z-20 pointer-events-none flex items-center justify-center"
								>
									<span className="font-mono text-xs text-red-500 font-bold tracking-widest uppercase animate-pulse">
										PURGING SYSTEM
									</span>
								</motion.div>
							)}
						</AnimatePresence>

						<Link
							href={`/canvas/${project.id}`}
							className="flex-1 flex flex-col overflow-hidden"
						>
							{/* Monitor / Thumbnail Area */}
							<div className="flex-1 bg-[#E5E5E5] dark:bg-[#111111] relative overflow-hidden">
								{project.thumbnail ? (
									<img
										src={project.thumbnail}
										alt={project.name}
										className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<div className="w-12 h-12 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
											<span className="font-mono text-sm text-neutral-400">
												{project.name.slice(0, 2).toUpperCase()}
											</span>
										</div>
									</div>
								)}

								{/* Overlay Info - Arrow */}
								<div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0">
									<div className="bg-[#FF4D00] text-white p-1 rounded-sm">
										<SwissIcons.ArrowUpRight className="w-4 h-4" />
									</div>
								</div>
							</div>

							{/* Control Deck / Info Area */}
							<div className="h-[88px] p-4 flex flex-col justify-between bg-[#F5F5F5] dark:bg-[#1E1E1E]">
								<div className="flex items-start justify-between gap-2">
									<h3 className="font-sans font-medium text-sm text-neutral-900 dark:text-white truncate leading-tight">
										{project.name}
									</h3>
									<div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 group-hover:bg-[#FF4D00] shrink-0 mt-1 transition-colors" />
								</div>

								<div className="flex items-end justify-between">
									<div className="flex flex-col gap-0.5">
										<span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
											ID: {project.id.slice(0, 6)}
										</span>
										<span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
											UPD:{" "}
											{new Date(project.updatedAt).toLocaleDateString("en-GB")}
										</span>
									</div>
								</div>
							</div>
						</Link>

						{/* Menu Trigger - Absolute positioned on top */}
						<div
							className={`absolute top-3 right-3 z-10 transition-opacity duration-200 ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
						>
							<DropdownMenu onOpenChange={setIsMenuOpen}>
								<DropdownMenuTrigger asChild>
									<button className="h-8 w-8 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm hover:bg-[#FF4D00] hover:text-white text-neutral-500 dark:text-neutral-400 rounded-sm transition-colors">
										<SwissIcons.More className="w-4 h-4" />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-48 font-mono text-xs uppercase bg-[#F5F5F5] dark:bg-[#1E1E1E] border-neutral-200 dark:border-neutral-800"
								>
									<DropdownMenuItem
										onClick={() => setIsEditOpen(true)}
										className="cursor-pointer focus:bg-[#E5E5E5] dark:focus:bg-[#2A2A2A]"
									>
										<SwissIcons.Edit className="w-3 h-3 mr-2" /> Edit Config
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => duplicateProject.mutate({ id: project.id })}
										className="cursor-pointer focus:bg-[#E5E5E5] dark:focus:bg-[#2A2A2A]"
									>
										<SwissIcons.Copy className="w-3 h-3 mr-2" /> Replicate
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => deleteProject.mutate({ id: project.id })}
										className="text-red-500 focus:text-red-500 cursor-pointer focus:bg-[#E5E5E5] dark:focus:bg-[#2A2A2A]"
									>
										<SwissIcons.Trash className="w-3 h-3 mr-2" /> Purge System
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<BraunDialog
				variant="cassette"
				mode="edit"
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
				initialData={{
					name: project.name,
					description: project.description || "",
				}}
				onSubmit={(data) => updateProject.mutate({ id: project.id, ...data })}
				isPending={updateProject.isPending}
			/>
		</>
	);
}

export function CreateProjectCard() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const trpc = useTRPC();
	const router = useRouter();

	const createProject = useMutation({
		...trpc.project.create.mutationOptions(),
		onSuccess: (project) => {
			toast.success("System initialized successfully");
			router.push(`/canvas/${project.id}`);
			setIsDialogOpen(false);
		},
		onError: (error) => {
			console.error("Failed to create project:", error);
			toast.error("Failed to initialize system");
		},
	});

	return (
		<>
			<button
				onClick={() => setIsDialogOpen(true)}
				className="group relative flex flex-col h-[280px] bg-[#F5F5F5] dark:bg-[#1E1E1E] border border-transparent hover:border-[#FF4D00] transition-colors duration-200 items-center justify-center gap-4 rounded-sm"
			>
				<div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-[#2A2A2A] flex items-center justify-center group-hover:bg-[#FF4D00] group-hover:text-white transition-colors duration-200 text-neutral-500">
					<SwissIcons.Plus className="w-6 h-6" />
				</div>
				<span className="font-mono text-xs text-neutral-500 uppercase tracking-widest group-hover:text-[#FF4D00] transition-colors">
					Initialize System
				</span>

				{/* Grip / Bottom Bezel */}
				<div className="absolute bottom-0 left-0 right-0 h-10 bg-[#e5e5e5] dark:bg-[#1a1a1a] border-t border-neutral-300 dark:border-neutral-800 flex items-center justify-center opacity-50">
					<div className="w-8 h-[2px] bg-neutral-300 dark:bg-neutral-700 rounded-full" />
				</div>
			</button>

			<BraunDialog
				variant="cassette"
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				mode="create"
				onSubmit={(data) => createProject.mutate(data)}
				isPending={createProject.isPending}
			/>
		</>
	);
}
