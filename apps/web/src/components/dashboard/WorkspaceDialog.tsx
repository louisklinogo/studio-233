"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SwissIcons } from "@/components/ui/SwissIcons";

interface WorkspaceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode?: "create" | "edit";
	initialData?: {
		name?: string;
		description?: string;
	};
	onSubmit: (data: { name: string; description: string }) => void;
	isPending: boolean;
}

export function WorkspaceDialog({
	open,
	onOpenChange,
	mode = "create",
	initialData,
	onSubmit,
	isPending,
}: WorkspaceDialogProps) {
	const [name, setName] = useState(initialData?.name || "");
	const [description, setDescription] = useState(
		initialData?.description || "",
	);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (open) {
			setName(initialData?.name || "");
			setDescription(initialData?.description || "");
		}
	}, [open, initialData]);

	const handleSubmit = () => {
		onSubmit({ name, description });
	};

	if (!mounted) return null;

	const dialogContent = (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => onOpenChange(false)}
						className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] z-[9998]"
					/>

					{/* Dialog Panel - BRAUN STYLE */}
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{
							type: "spring",
							damping: 30,
							stiffness: 300,
							mass: 0.8,
						}}
						className="fixed right-4 top-4 bottom-4 w-[480px] bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-900 z-[9999] shadow-2xl flex flex-col"
					>
						{/* Header Visual - NETWORK HUB */}
						<div className="h-[220px] bg-neutral-100 dark:bg-neutral-900/30 relative overflow-hidden group border-b border-neutral-200 dark:border-neutral-900">
							<div className="absolute inset-0 flex items-center justify-center">
								{/* Network Visualization */}
								<div className="relative w-full h-full">
									<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-200/40 via-transparent to-transparent dark:from-neutral-800/40" />

									{/* Central Node */}
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
										<div className="w-16 h-16 bg-white dark:bg-[#111] border border-neutral-300 dark:border-neutral-700 shadow-xl flex items-center justify-center rounded-sm rotate-45">
											<div className="w-12 h-12 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center -rotate-45">
												<span className="font-mono text-2xl font-bold text-[#FF4D00]">
													W
												</span>
											</div>
										</div>
									</div>

									{/* Satellite Nodes */}
									{[0, 1, 2, 3].map((i) => (
										<motion.div
											key={i}
											initial={{ opacity: 0, scale: 0 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: i * 0.1 }}
											className="absolute w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center z-0"
											style={{
												top: i === 0 ? "25%" : i === 1 ? "75%" : "50%",
												left:
													i === 0
														? "50%"
														: i === 1
															? "50%"
															: i === 2
																? "25%"
																: "75%",
												transform: "translate(-50%, -50%)",
											}}
										>
											<div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
										</motion.div>
									))}

									{/* Lines */}
									<svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
										<line
											x1="50%"
											y1="50%"
											x2="50%"
											y2="25%"
											stroke="currentColor"
											strokeWidth="1"
											className="text-neutral-400 dark:text-neutral-600"
										/>
										<line
											x1="50%"
											y1="50%"
											x2="50%"
											y2="75%"
											stroke="currentColor"
											strokeWidth="1"
											className="text-neutral-400 dark:text-neutral-600"
										/>
										<line
											x1="50%"
											y1="50%"
											x2="25%"
											y2="50%"
											stroke="currentColor"
											strokeWidth="1"
											className="text-neutral-400 dark:text-neutral-600"
										/>
										<line
											x1="50%"
											y1="50%"
											x2="75%"
											y2="50%"
											stroke="currentColor"
											strokeWidth="1"
											className="text-neutral-400 dark:text-neutral-600"
										/>
									</svg>
								</div>
							</div>

							<button
								onClick={() => onOpenChange(false)}
								className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors z-20"
							>
								<SwissIcons.Close className="w-5 h-5" />
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 flex flex-col">
							<div className="p-8 space-y-8 flex-1 overflow-y-auto">
								<div className="space-y-2">
									<div className="flex items-center gap-3">
										<div className="w-1.5 h-1.5 bg-[#FF4D00]" />
										<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF4D00]">
											{mode === "create" ? "New Workspace" : "Edit Workspace"}
										</span>
									</div>
									<h2 className="text-3xl font-medium text-neutral-900 dark:text-white tracking-tight">
										{mode === "create"
											? "Initialize Workspace"
											: "Update Workspace"}
									</h2>
									<p className="text-sm text-neutral-500 max-w-[90%]">
										Workspaces organize your Canvas and Studio projects into
										logical groups.
									</p>
								</div>

								<div className="space-y-6">
									<div className="group relative pt-4">
										<label className="absolute top-0 left-0 text-[9px] font-mono uppercase tracking-widest text-neutral-500 transition-colors group-focus-within:text-[#FF4D00]">
											Workspace Name
										</label>
										<input
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="My Workspace"
											className="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-800 py-2 font-sans text-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-700 outline-none focus:border-[#FF4D00] transition-colors rounded-none"
										/>
									</div>

									<div className="group relative pt-4">
										<label className="absolute top-0 left-0 text-[9px] font-mono uppercase tracking-widest text-neutral-500 transition-colors group-focus-within:text-[#FF4D00]">
											Description (Optional)
										</label>
										<textarea
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Add context about this workspace..."
											className="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-800 py-2 font-sans text-sm text-neutral-600 dark:text-neutral-400 placeholder:text-neutral-400 dark:placeholder:text-neutral-700 outline-none focus:border-[#FF4D00] transition-colors rounded-none min-h-[80px] resize-none"
										/>
									</div>
								</div>
							</div>

							{/* Footer / Action - BRAUN STYLE */}
							<div className="p-8 border-t border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-[#0a0a0a]">
								<button
									onClick={handleSubmit}
									disabled={isPending || !name.trim()}
									className="w-full h-14 bg-neutral-900 dark:bg-white hover:bg-[#FF4D00] disabled:opacity-50 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-white text-white dark:text-black hover:text-white transition-all duration-300 flex items-center justify-between px-6 group"
								>
									<span className="font-mono text-xs uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">
										{isPending
											? "Initializing..."
											: mode === "create"
												? "Initialize Workspace"
												: "Update System"}
									</span>
									<SwissIcons.ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
								</button>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);

	return createPortal(dialogContent, document.body);
}
