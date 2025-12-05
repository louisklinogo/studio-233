"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { useTRPC } from "@/trpc/client";
import { WorkspaceDialog } from "./WorkspaceDialog";

interface Workspace {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	_count: {
		projects: number;
	};
}

interface WorkspaceSwitcherProps {
	workspaces: Workspace[];
	selectedWorkspaceId: string;
	onSelectWorkspace: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({
	workspaces,
	selectedWorkspaceId,
	onSelectWorkspace,
}: WorkspaceSwitcherProps) {
	const trpc = useTRPC();
	const router = useRouter();
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const createWorkspace = useMutation({
		...trpc.workspace.create.mutationOptions(),
		onSuccess: (newItem) => {
			toast.success("Workspace initialized");
			setIsCreateOpen(false);
			router.refresh();
			onSelectWorkspace(newItem.id);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create workspace");
		},
	});

	const selectedWorkspace = workspaces.find(
		(w) => w.id === selectedWorkspaceId,
	);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="flex items-center gap-2 px-3 py-2 -ml-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group">
						<div className="w-8 h-8 rounded-sm bg-[#FF4D00] text-white flex items-center justify-center font-mono text-xs font-bold shadow-sm">
							{selectedWorkspace?.name.substring(0, 1).toUpperCase() || "W"}
						</div>
						<div className="flex flex-col items-start text-left">
							<span className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-[#FF4D00] transition-colors">
								{selectedWorkspace?.name || "Select Workspace"}
							</span>
							<span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
								{selectedWorkspace?._count.projects || 0} Projects Active
							</span>
						</div>
						<SwissIcons.ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 ml-1" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="w-[280px] p-2 bg-white dark:bg-[#111111] border-neutral-200 dark:border-neutral-800 shadow-xl"
				>
					<div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
						Active Systems
					</div>
					{workspaces.map((ws) => (
						<DropdownMenuItem
							key={ws.id}
							onClick={() => onSelectWorkspace(ws.id)}
							className={`flex items-center justify-between py-2.5 px-3 cursor-pointer rounded-sm mb-1 ${
								selectedWorkspaceId === ws.id
									? "bg-neutral-100 dark:bg-neutral-800"
									: "hover:bg-neutral-50 dark:hover:bg-neutral-900"
							}`}
						>
							<div className="flex items-center gap-3">
								<div
									className={`w-2 h-2 rounded-full ${
										selectedWorkspaceId === ws.id
											? "bg-[#FF4D00]"
											: "bg-neutral-300 dark:bg-neutral-700"
									}`}
								/>
								<span
									className={`font-sans text-sm ${
										selectedWorkspaceId === ws.id
											? "text-neutral-900 dark:text-white font-medium"
											: "text-neutral-600 dark:text-neutral-400"
									}`}
								>
									{ws.name}
								</span>
							</div>
							<span className="text-[10px] font-mono text-neutral-400">
								{ws._count.projects}
							</span>
						</DropdownMenuItem>
					))}

					<DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800 my-2" />

					<DropdownMenuItem
						onClick={() => setIsCreateOpen(true)}
						className="py-2.5 px-3 cursor-pointer rounded-sm hover:bg-[#FF4D00]/10 hover:text-[#FF4D00] group transition-colors"
					>
						<div className="flex items-center gap-3">
							<div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700 group-hover:border-[#FF4D00] flex items-center justify-center transition-colors">
								<SwissIcons.Plus className="w-2.5 h-2.5" />
							</div>
							<span className="font-sans text-sm font-medium">
								Initialize New Workspace
							</span>
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Workspace Creation Dialog (Simpler, No Type Selector) */}
			<WorkspaceDialog
				open={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				mode="create"
				onSubmit={(data) => createWorkspace.mutate(data)}
				isPending={createWorkspace.isPending}
			/>
		</>
	);
}
