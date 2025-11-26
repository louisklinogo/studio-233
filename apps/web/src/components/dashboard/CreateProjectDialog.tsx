"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";

interface CreateProjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
	open,
	onOpenChange,
}: CreateProjectDialogProps) {
	const trpc = useTRPC();
	const router = useRouter();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const createProject = useMutation({
		...trpc.project.create.mutationOptions(),
		onSuccess: (project) => {
			toast.success("System initialized successfully");
			router.push(`/canvas/${project.id}`);
			onOpenChange(false);
		},
		onError: (error) => {
			console.error("Failed to create project:", error);
			toast.error("Failed to initialize system");
		},
	});

	const handleCreate = () => {
		createProject.mutate({
			name: name || undefined,
			description: description || undefined,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px] bg-[#F5F5F5] dark:bg-[#111111] border-none p-0 overflow-hidden gap-0 shadow-2xl">
				<DialogHeader className="p-6 pb-2">
					<DialogTitle className="font-mono text-xs uppercase tracking-widest text-[#FF4D00] flex items-center gap-2">
						<div className="w-2 h-2 bg-[#FF4D00] rounded-full animate-pulse" />
						System Initialization
					</DialogTitle>
				</DialogHeader>

				<div className="p-6 pt-2 grid gap-6">
					<div className="grid gap-2">
						<Label
							htmlFor="name"
							className="font-mono text-[10px] uppercase text-neutral-400"
						>
							Project Designation
						</Label>
						<Input
							id="name"
							placeholder="UNTITLED_PROJECT"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-800 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#FF4D00] font-sans text-lg text-neutral-900 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
						/>
					</div>
					<div className="grid gap-2">
						<Label
							htmlFor="description"
							className="font-mono text-[10px] uppercase text-neutral-400"
						>
							Parameters / Notes
						</Label>
						<Textarea
							id="description"
							placeholder="Optional system parameters..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="bg-neutral-100 dark:bg-[#1A1A1A] border-0 rounded-sm p-3 focus-visible:ring-0 font-sans text-sm min-h-[100px] resize-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
						/>
					</div>
				</div>

				<DialogFooter className="p-4 bg-white dark:bg-[#161616] border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between sm:justify-between">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="font-mono text-xs uppercase text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-transparent"
					>
						Abort
					</Button>
					<Button
						onClick={handleCreate}
						disabled={createProject.isPending}
						className="bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-mono text-xs uppercase rounded-sm px-6"
					>
						{createProject.isPending ? (
							<>
								<Loader2 className="mr-2 h-3 w-3 animate-spin" />
								Booting...
							</>
						) : (
							"Initialize"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
