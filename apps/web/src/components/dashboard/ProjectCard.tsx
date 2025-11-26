"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
	project: {
		id: string;
		name: string;
		updatedAt: Date;
		thumbnail: string | null;
	};
}

export function ProjectCard({ project }: ProjectCardProps) {
	return (
		<Link
			href={`/canvas/${project.id}`}
			className="group relative flex flex-col bg-[#f4f4f0] dark:bg-[#111111] rounded-sm shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
		>
			{/* Cartridge Body */}
			<div className="p-1 pb-0 flex-1 flex flex-col">
				{/* Paper Label Area */}
				<div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-4 flex-1 relative overflow-hidden group-hover:border-[#FF4D00] transition-colors">
					{/* Write Protect Notch */}
					<div className="absolute top-0 right-0 w-4 h-4 bg-[#f4f4f0] dark:bg-[#111111] border-b border-l border-neutral-200 dark:border-neutral-800" />

					<div className="flex justify-between items-start mb-4">
						<div className="w-8 h-8 bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 flex items-center justify-center font-mono text-xs font-bold text-neutral-500">
							{project.name.slice(0, 2).toUpperCase()}
						</div>
						<ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-[#FF4D00] transition-colors" />
					</div>

					<h3 className="font-bold text-neutral-900 dark:text-white truncate pr-4">
						{project.name}
					</h3>
					<p className="font-mono text-[9px] text-neutral-400 mt-1">
						ID: {project.id.slice(0, 8)}
					</p>
				</div>
			</div>

			{/* Grip / Bottom Bezel */}
			<div className="h-10 bg-[#e5e5e5] dark:bg-[#1a1a1a] border-t border-neutral-300 dark:border-neutral-800 flex items-center justify-center gap-1 relative">
				{/* Grip Ridges */}
				<div className="w-12 h-[2px] bg-neutral-300 dark:bg-neutral-700 rounded-full" />
				<div className="w-12 h-[2px] bg-neutral-300 dark:bg-neutral-700 rounded-full" />
				<div className="w-12 h-[2px] bg-neutral-300 dark:bg-neutral-700 rounded-full" />

				<div className="absolute right-3 top-1/2 -translate-y-1/2">
					<p className="font-mono text-[8px] text-neutral-400 tracking-widest">
						{new Date(project.updatedAt).toLocaleDateString()}
					</p>
				</div>
			</div>
		</Link>
	);
}

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";

export function CreateProjectCard() {
	const trpc = useTRPC();
	const router = useRouter();
	const [isCreating, setIsCreating] = useState(false);
	const createProject = useMutation({
		...trpc.project.create.mutationOptions(),
		onSuccess: (project) => {
			router.push(`/canvas/${project.id}`);
		},
		onError: (error) => {
			console.error("Failed to create project:", error);
			setIsCreating(false);
		},
	});

	const handleCreate = () => {
		setIsCreating(true);
		createProject.mutate({});
	};

	return (
		<button
			onClick={handleCreate}
			disabled={isCreating}
			className="group relative flex flex-col h-full min-h-[180px] bg-[#f4f4f0] dark:bg-[#111111] rounded-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-[#FF4D00] disabled:opacity-50 disabled:cursor-not-allowed"
		>
			<div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
				<div className="w-10 h-10 rounded-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-[#FF4D00] group-hover:border-[#FF4D00] transition-colors">
					{isCreating ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : (
						<Plus className="w-5 h-5" />
					)}
				</div>
				<span className="font-mono text-xs text-neutral-500 group-hover:text-[#FF4D00] transition-colors uppercase tracking-widest">
					{isCreating ? "Initializing..." : "Initialize Cartridge"}
				</span>
			</div>

			{/* Grip / Bottom Bezel */}
			<div className="h-10 bg-[#e5e5e5] dark:bg-[#1a1a1a] border-t border-neutral-300 dark:border-neutral-800 flex items-center justify-center opacity-50">
				<div className="w-8 h-[2px] bg-neutral-300 dark:bg-neutral-700 rounded-full" />
			</div>
		</button>
	);
}
