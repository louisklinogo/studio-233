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
	variant: "cassette" | "lid" | "expansion" | "sheet";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode?: "create" | "edit";
	initialData?: {
		name?: string;
		description?: string;
		type?: "CANVAS" | "STUDIO";
	};
	onSubmit: (data: {
		name: string;
		description: string;
		type?: "CANVAS" | "STUDIO";
	}) => void;
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
	const [type, setType] = useState<"CANVAS" | "STUDIO">(
		initialData?.type || "CANVAS",
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
			setType(initialData?.type || "CANVAS");
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
		onSubmit({ name, description, type });
	};

	if (!mounted) return null;

	const dialogContent = (
		<AnimatePresence>
			{open && (
				<>
					{/* CASSETTE VARIANT */}
					{variant === "cassette" && (
						<>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => onOpenChange(false)}
								className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[9999]"
							/>
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

					{/* SHEET VARIANT - NEW MIDDAY INSPIRED */}
					{variant === "sheet" && (
						<>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => onOpenChange(false)}
								className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] z-[9998]"
							/>
							<motion.div
								initial={{ x: "100%" }}
								animate={{ x: 0 }}
								transition={{
									type: "spring",
									damping: 30,
									stiffness: 300,
									mass: 0.8,
								}}
								className="fixed right-4 top-4 bottom-4 w-[480px] bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-900 z-[9999] shadow-2xl flex flex-col"
							>
								{/* Header Image/Preview Area - STRICT GRID */}
								<div className="h-[220px] bg-neutral-100 dark:bg-neutral-900/30 relative overflow-hidden group border-b border-neutral-200 dark:border-neutral-900">
									<div className="absolute inset-0 flex items-center justify-center">
										{type === "CANVAS" ? (
											// Canvas Visual - INFINITE POSSIBILITY
											<div className="relative w-full h-full flex items-center justify-center">
												<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-200/50 via-transparent to-transparent dark:from-neutral-800/50" />

												{/* Floating Nodes */}
												<motion.div
													animate={{ rotate: 360 }}
													transition={{
														duration: 60,
														repeat: Infinity,
														ease: "linear",
													}}
													className="absolute inset-0"
												>
													<div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#FF4D00] rounded-full shadow-[0_0_15px_#FF4D00]" />
													<div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
													<div className="absolute top-1/2 right-1/3 w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
												</motion.div>

												{/* Central Hub */}
												<div className="relative z-10 w-24 h-24 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
													<div className="w-16 h-16 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
														<SwissIcons.Grid className="w-6 h-6 text-[#FF4D00]" />
													</div>
												</div>

												{/* Connecting Lines (Decorators) */}
												<svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
													<circle
														cx="50%"
														cy="50%"
														r="120"
														stroke="currentColor"
														strokeWidth="1"
														strokeDasharray="4 4"
														className="text-neutral-300 dark:text-neutral-700"
													/>
												</svg>
											</div>
										) : (
											// Studio Visual - STRUCTURED PIPELINE
											<div className="relative w-full h-full flex items-center justify-center gap-4">
												{/* Input Node */}
												<div className="flex flex-col items-center gap-2 opacity-50">
													<div className="w-12 h-16 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-neutral-50 dark:bg-[#111]" />
													<div className="w-1 h-8 border-l border-dashed border-neutral-400" />
												</div>

												{/* Processing Node (Active) */}
												<div className="relative z-10 flex flex-col items-center gap-2">
													<div className="w-20 h-24 border border-[#FF4D00]/30 bg-[#FF4D00]/5 rounded-sm flex flex-col items-center justify-center gap-1 shadow-[0_0_30px_-10px_rgba(255,77,0,0.3)]">
														<SwissIcons.Layers className="w-6 h-6 text-[#FF4D00]" />
														<div className="w-12 h-0.5 bg-[#FF4D00]/50" />
														<div className="w-8 h-0.5 bg-[#FF4D00]/30" />
													</div>
												</div>

												{/* Output Node */}
												<div className="flex flex-col items-center gap-2 opacity-50">
													<div className="w-12 h-16 border border-neutral-300 dark:border-neutral-700 rounded-sm bg-neutral-50 dark:bg-[#111]" />
													<div className="w-1 h-8 border-l border-dashed border-neutral-400" />
												</div>

												{/* Flow Line */}
												<div className="absolute top-1/2 left-10 right-10 h-[1px] bg-neutral-200 dark:bg-neutral-800 -z-10" />
											</div>
										)}
									</div>

									{/* Gradient & Scanlines */}
									<div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0c0c0c] via-transparent to-transparent z-10" />

									<button
										onClick={() => onOpenChange(false)}
										className="absolute top-6 right-6 text-neutral-400 dark:text-neutral-600 hover:text-[#FF4D00] transition-colors z-50"
									>
										<SwissIcons.Close className="w-5 h-5" />
									</button>
								</div>

								{/* Content - FORM FOLLOWS FUNCTION */}
								<div className="flex-1 flex flex-col">
									<div className="p-8 space-y-8 flex-1 overflow-y-auto">
										{/* Title Block */}
										<div className="space-y-2">
											<div className="flex items-center gap-3">
												<div className="w-1.5 h-1.5 bg-[#FF4D00]" />
												<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF4D00]">
													System Initialization
												</span>
											</div>
											<h2 className="text-3xl font-medium text-neutral-900 dark:text-white tracking-tight">
												{type === "CANVAS" ? "New Canvas" : "New Studio"}
											</h2>
											<p className="text-sm text-neutral-500 max-w-[90%]">
												{type === "CANVAS"
													? "Initialize an infinite workspace for unstructured generation."
													: "Initialize a structured environment for batch processing."}
											</p>
										</div>

										{/* Config Form */}
										<div className="space-y-8 pt-4">
											{/* Type Toggle - MECHANICAL */}
											<div className="grid grid-cols-2 gap-0 border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/20 p-1">
												<button
													onClick={() => setType("CANVAS")}
													className={`relative h-12 flex items-center justify-center gap-3 transition-all duration-200 ${
														type === "CANVAS"
															? "bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white shadow-sm"
															: "text-neutral-500 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-400"
													}`}
												>
													<SwissIcons.Grid className="w-4 h-4" />
													<span className="font-mono text-[10px] uppercase tracking-widest">
														Canvas
													</span>
													{type === "CANVAS" && (
														<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF4D00]" />
													)}
												</button>
												<button
													onClick={() => setType("STUDIO")}
													className={`relative h-12 flex items-center justify-center gap-3 transition-all duration-200 ${
														type === "STUDIO"
															? "bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white shadow-sm"
															: "text-neutral-500 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-400"
													}`}
												>
													<SwissIcons.Layers className="w-4 h-4" />
													<span className="font-mono text-[10px] uppercase tracking-widest">
														Studio
													</span>
													{type === "STUDIO" && (
														<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF4D00]" />
													)}
												</button>
											</div>

											{/* Inputs - STRICT LINES (No Boxes) */}
											<div className="space-y-6">
												<div className="group relative pt-4">
													<label className="absolute top-0 left-0 text-[9px] font-mono uppercase tracking-widest text-neutral-500 transition-colors group-focus-within:text-[#FF4D00]">
														Project Designation
													</label>
													<input
														value={name}
														onChange={(e) => setName(e.target.value)}
														placeholder="UNTITLED_PROJECT"
														className="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-800 py-2 font-sans text-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-700 outline-none focus:border-[#FF4D00] transition-colors rounded-none"
													/>
												</div>

												<div className="group relative pt-4">
													<label className="absolute top-0 left-0 text-[9px] font-mono uppercase tracking-widest text-neutral-500 transition-colors group-focus-within:text-[#FF4D00]">
														Operational Context
													</label>
													<textarea
														value={description}
														onChange={(e) => setDescription(e.target.value)}
														placeholder="Add system notes..."
														className="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-800 py-2 font-sans text-sm text-neutral-600 dark:text-neutral-400 placeholder:text-neutral-400 dark:placeholder:text-neutral-700 outline-none focus:border-[#FF4D00] transition-colors rounded-none min-h-[80px] resize-none"
													/>
												</div>
											</div>
										</div>
									</div>

									{/* Bottom Action Bar - WEIGHTY */}
									<div className="p-8 border-t border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-[#0a0a0a]">
										<button
											onClick={handleSubmit}
											disabled={isPending}
											className="w-full h-14 bg-neutral-900 dark:bg-white hover:bg-[#FF4D00] disabled:opacity-50 disabled:hover:bg-neutral-900 dark:disabled:hover:bg-white text-white dark:text-black hover:text-white transition-all duration-300 flex items-center justify-between px-6 group"
										>
											<span className="font-mono text-xs uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">
												{isPending ? "Initializing..." : "Initialize System"}
											</span>
											<SwissIcons.ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
										</button>
									</div>
								</div>
							</motion.div>
						</>
					)}

					{/* LID VARIANT */}
					{variant === "lid" && (
						<div className="fixed inset-0 flex items-center justify-center z-[9999]">
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => onOpenChange(false)}
								className="absolute inset-0 bg-black/40 backdrop-blur-sm"
							/>
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

					{/* EXPANSION VARIANT */}
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
									initial={{ width: 300, height: 180 }}
									animate={{ width: 340, height: 480 }}
									exit={{ width: 300, height: 180, opacity: 0 }}
									transition={{ type: "spring", damping: 25, stiffness: 300 }}
								>
									<div className="bg-white dark:bg-[#1a1a1a] border-b border-neutral-200 dark:border-neutral-800 p-6 pb-8 relative">
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
									<div className="flex-1 bg-[#f4f4f0] dark:bg-[#111111] p-1 flex flex-col justify-end">
										<div className="bg-[#e5e5e5] dark:bg-[#1a1a1a] border-t border-neutral-300 dark:border-neutral-800 p-4 space-y-4">
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
