"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { Textarea } from "@/components/ui/textarea";

interface BraunDialogProps {
	variant: "cassette" | "lid" | "expansion";
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

export function BraunDialog({
	variant,
	open,
	onOpenChange,
	mode = "create",
	initialData,
	onSubmit,
	isPending,
}: BraunDialogProps) {
	const [name, setName] = useState(initialData?.name || "");
	const [description, setDescription] = useState(
		initialData?.description || "",
	);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Reset form when open state changes or initialData changes
	useEffect(() => {
		if (open) {
			setName(initialData?.name || "");
			setDescription(initialData?.description || "");
		}
	}, [open, initialData]);

	const playClickSound = () => {
		const AudioContext =
			window.AudioContext || (window as any).webkitAudioContext;
		if (!AudioContext) return;

		const ctx = new AudioContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.type = "square";
		osc.frequency.setValueAtTime(150, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

		gain.gain.setValueAtTime(0.1, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.1);
	};

	const handleSubmit = () => {
		playClickSound();
		onSubmit({ name, description });
	};

	if (!mounted) return null;

	const dialogContent = (
		<AnimatePresence>
			{open && (
				<>
					{/* ... all variants ... */}
					{variant === "cassette" && (
						<>
							{/* Backdrop */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => onOpenChange(false)}
								className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[9999]"
							/>

							{/* Panel */}
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
								className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#F5F5F5] dark:bg-[#1E1E1E] border-l border-neutral-200 dark:border-neutral-800 z-[9999] shadow-2xl flex flex-col"
							>
								<div className="h-16 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 bg-[#E5E5E5] dark:bg-[#111]">
									<span className="font-mono text-xs uppercase tracking-widest text-[#FF4D00] flex items-center gap-2">
										<div className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full animate-pulse" />
										{mode === "create" ? "System Deck" : "System Config"}
									</span>
									<button
										onClick={() => onOpenChange(false)}
										className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
									>
										<SwissIcons.Close className="w-4 h-4" />
									</button>
								</div>

								<div className="p-8 space-y-8 flex-1 overflow-y-auto bg-[#F5F5F5] dark:bg-[#1E1E1E]">
									<div className="space-y-2">
										<Label className="font-mono text-[10px] uppercase text-neutral-500">
											Project Designation
										</Label>
										<Input
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="UNTITLED_PROJECT"
											className="bg-[#e5e5e5] dark:bg-[#111] border-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] text-neutral-900 dark:text-white font-mono h-12 rounded-sm focus-visible:ring-1 focus-visible:ring-[#FF4D00]"
										/>
									</div>
									<div className="space-y-2">
										<Label className="font-mono text-[10px] uppercase text-neutral-500">
											Parameters
										</Label>
										<Textarea
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="System notes..."
											className="bg-[#e5e5e5] dark:bg-[#111] border-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] text-neutral-900 dark:text-white font-mono min-h-[150px] rounded-sm focus-visible:ring-1 focus-visible:ring-[#FF4D00] resize-none"
										/>
									</div>
								</div>

								<div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-[#E5E5E5] dark:bg-[#111]">
									<Button
										onClick={handleSubmit}
										disabled={isPending}
										className="w-full bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-mono text-xs uppercase h-12 rounded-sm shadow-sm active:translate-y-[1px] transition-all"
									>
										{isPending ? (
											<SwissIcons.Spinner className="w-4 h-4 animate-spin" />
										) : mode === "create" ? (
											"Initialize System"
										) : (
											"Update Configuration"
										)}
									</Button>
								</div>
							</motion.div>
						</>
					)}

					{variant === "lid" && (
						<div className="fixed inset-0 flex items-center justify-center z-[9999]">
							{/* Backdrop */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => onOpenChange(false)}
								className="absolute inset-0 bg-black/40 backdrop-blur-sm"
							/>

							{/* Dialog Container with Perspective */}
							<div className="relative perspective-[2000px] group">
								<motion.div
									initial={{ rotateX: -25, opacity: 0, y: 40, scale: 0.9 }}
									animate={{ rotateX: 0, opacity: 1, y: 0, scale: 1 }}
									exit={{ rotateX: -20, opacity: 0, y: 30, scale: 0.95 }}
									transition={{
										type: "spring",
										damping: 20,
										stiffness: 100,
										mass: 1,
									}}
									style={{ transformOrigin: "top center" }}
									className="w-[480px] bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden"
								>
									<div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#FF4D00] to-transparent opacity-50" />

									<div className="p-8 space-y-6">
										<div className="space-y-1 text-center">
											<h2 className="font-mono text-sm uppercase tracking-[0.2em] text-neutral-900 dark:text-white">
												{mode === "create"
													? "Configuration"
													: "Reconfiguration"}
											</h2>
											<p className="text-xs text-neutral-500 dark:text-neutral-400">
												{mode === "create"
													? "Enter project specifications"
													: "Update project specifications"}
											</p>
										</div>

										<div className="space-y-4 pt-4">
											<div className="group">
												<Label className="sr-only">Name</Label>
												<Input
													value={name}
													onChange={(e) => setName(e.target.value)}
													placeholder="Project Name"
													className="text-center text-lg bg-transparent border-b border-neutral-300 dark:border-neutral-700 border-t-0 border-x-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#FF4D00] placeholder:text-neutral-300"
												/>
											</div>
											<div className="group">
												<Label className="sr-only">Description</Label>
												<Textarea
													value={description}
													onChange={(e) => setDescription(e.target.value)}
													placeholder="Description (Optional)"
													className="text-center bg-transparent border-b border-neutral-300 dark:border-neutral-700 border-t-0 border-x-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#FF4D00] min-h-[80px] resize-none placeholder:text-neutral-300"
												/>
											</div>
										</div>

										<div className="flex gap-3 pt-4">
											<Button
												variant="ghost"
												onClick={() => onOpenChange(false)}
												className="flex-1 font-mono text-xs uppercase text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
											>
												Close Lid
											</Button>
											<Button
												onClick={handleSubmit}
												disabled={isPending}
												className="flex-1 bg-[#FF4D00] hover:bg-[#CC3D00] text-white font-mono text-xs uppercase rounded-full"
											>
												{isPending ? (
													<SwissIcons.Spinner className="w-4 h-4 animate-spin" />
												) : mode === "create" ? (
													"Boot"
												) : (
													"Update"
												)}
											</Button>
										</div>
									</div>
								</motion.div>
							</div>
						</div>
					)}

					{variant === "expansion" && (
						<>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => onOpenChange(false)}
								className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9998]"
							/>
							<div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
								<motion.div
									layoutId={`project-card-${mode}`}
									className="w-[320px] bg-[#f4f4f0] dark:bg-[#111111] rounded-sm shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
									initial={{ width: 300, height: 180 }} // Match card size roughly
									animate={{ width: 340, height: 480 }}
									exit={{ width: 300, height: 180, opacity: 0 }}
									transition={{ type: "spring", damping: 25, stiffness: 300 }}
								>
									{/* Header / Label Area */}
									<div className="bg-white dark:bg-[#1a1a1a] border-b border-neutral-200 dark:border-neutral-800 p-6 pb-8 relative">
										{/* Write Protect Notch */}
										<div className="absolute top-0 right-0 w-4 h-4 bg-[#f4f4f0] dark:bg-[#111111] border-b border-l border-neutral-200 dark:border-neutral-800" />

										<div className="space-y-6">
											<div className="flex items-center justify-between">
												<span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
													{mode === "create"
														? `Index No. ${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`
														: "System Configuration"}
												</span>
												<div className="w-2 h-2 bg-[#FF4D00] rounded-full" />
											</div>

											<div className="space-y-4">
												<div className="space-y-1">
													<Label className="font-mono text-[9px] uppercase text-neutral-400 block">
														Label / Name
													</Label>
													<input
														autoFocus
														value={name}
														onChange={(e) => setName(e.target.value)}
														className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-[#FF4D00] outline-none font-sans text-lg text-neutral-900 dark:text-white py-1 placeholder:text-neutral-300"
														placeholder="Untitled"
													/>
												</div>

												<div className="space-y-1">
													<Label className="font-mono text-[9px] uppercase text-neutral-400 block">
														Data / Context
													</Label>
													<textarea
														value={description}
														onChange={(e) => setDescription(e.target.value)}
														className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 focus:border-[#FF4D00] outline-none font-sans text-sm text-neutral-600 dark:text-neutral-400 py-1 min-h-[80px] resize-none placeholder:text-neutral-300"
														placeholder="Add description..."
													/>
												</div>
											</div>
										</div>
									</div>

									{/* Body / Grip */}
									<div className="flex-1 bg-[#f4f4f0] dark:bg-[#111111] p-1 flex flex-col justify-end">
										<div className="bg-[#e5e5e5] dark:bg-[#1a1a1a] border-t border-neutral-300 dark:border-neutral-800 p-4 space-y-4">
											{/* Grip Ridges */}
											<div className="flex gap-1 justify-center mb-4 opacity-20">
												<div className="w-8 h-[2px] bg-neutral-900 dark:bg-white rounded-full" />
												<div className="w-8 h-[2px] bg-neutral-900 dark:bg-white rounded-full" />
												<div className="w-8 h-[2px] bg-neutral-900 dark:bg-white rounded-full" />
											</div>

											<div className="grid grid-cols-2 gap-2">
												<button
													onClick={() => onOpenChange(false)}
													className="h-10 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm transition-colors"
												>
													Eject
												</button>
												<button
													onClick={handleSubmit}
													disabled={isPending}
													className="h-10 bg-[#FF4D00] hover:bg-[#CC3D00] text-white flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest rounded-sm transition-colors"
												>
													{isPending ? (
														<SwissIcons.Spinner className="w-3 h-3 animate-spin" />
													) : (
														<>
															{mode === "create" ? "Insert" : "Save"}{" "}
															<SwissIcons.ArrowDown className="w-3 h-3" />
														</>
													)}
												</button>
											</div>
										</div>
									</div>
								</motion.div>
							</div>
						</>
					)}
				</>
			)}
		</AnimatePresence>
	);

	return createPortal(dialogContent, document.body);
}
