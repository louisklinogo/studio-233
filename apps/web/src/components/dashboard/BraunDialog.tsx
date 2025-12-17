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
										disabled={isPending || !name.trim()}
										className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-mono text-xs uppercase h-12 rounded-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
									>
										{/* Scanline Effect */}
										<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-black/10 to-transparent -translate-x-[100%] group-hover:animate-shine pointer-events-none" />

										{isPending ? (
											<div className="flex items-center gap-2">
												<span className="animate-pulse">PROCESSING</span>
												<div className="w-1 h-1 bg-current rounded-full animate-bounce" />
												<div className="w-1 h-1 bg-current rounded-full animate-bounce delay-75" />
												<div className="w-1 h-1 bg-current rounded-full animate-bounce delay-150" />
											</div>
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

					{/* SHEET VARIANT - PRISM / GLASS AESTHETIC */}
					{variant === "sheet" && (
						<>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => onOpenChange(false)}
								className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[4px] z-[9998]"
							/>
							<motion.div
								initial={{ x: "100%" }}
								animate={{ x: 0 }}
								transition={{
									type: "spring",
									damping: 35,
									stiffness: 350,
									mass: 1,
								}}
								className="fixed right-4 top-4 bottom-4 w-[480px] bg-white dark:bg-[#050505] border border-neutral-200 dark:border-neutral-800 z-[9999] shadow-2xl flex flex-col overflow-hidden rounded-lg"
							>
								{/* Header - MATTE BEZEL */}
								<div className="h-28 bg-[#f4f4f0] dark:bg-[#111] border-b border-neutral-200 dark:border-neutral-800 p-8 flex flex-col justify-between relative">
									<div className="flex justify-between items-start">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-emerald-500 rounded-full" />
											<span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
												SYSTEM_READY
											</span>
										</div>
									</div>
									<div className="flex items-end justify-between">
										<h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
											{type === "CANVAS" ? "CANVAS" : "STUDIO"}
										</h1>
										<div className="text-neutral-400">
											{type === "CANVAS" ? (
												<SwissIcons.Frame size={24} />
											) : (
												<SwissIcons.Sequence size={24} />
											)}
										</div>
									</div>
								</div>

								{/* Content - CLEAN FORM */}
								<div className="flex-1 p-8 space-y-8 overflow-y-auto">
									<div className="space-y-6">
										{/* Type Toggle - MECHANICAL SWITCH */}
										<div className="bg-neutral-100 dark:bg-[#111] p-1 rounded-md flex">
											<button
												onClick={() => setType("CANVAS")}
												className={`flex-1 h-10 flex items-center justify-center gap-2 rounded transition-all font-mono text-[10px] uppercase tracking-widest font-bold ${
													type === "CANVAS"
														? "bg-white dark:bg-[#1A1A1A] text-black dark:text-white shadow-sm"
														: "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300"
												}`}
											>
												<SwissIcons.Frame className="w-3 h-3" />
												Canvas
											</button>
											<button
												onClick={() => setType("STUDIO")}
												className={`flex-1 h-10 flex items-center justify-center gap-2 rounded transition-all font-mono text-[10px] uppercase tracking-widest font-bold ${
													type === "STUDIO"
														? "bg-white dark:bg-[#1A1A1A] text-black dark:text-white shadow-sm"
														: "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300"
												}`}
											>
												<SwissIcons.Sequence className="w-3 h-3" />
												Studio
											</button>
										</div>

										<div className="space-y-2">
											<Label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
												Project Designation
											</Label>
											<input
												value={name}
												onChange={(e) => setName(e.target.value)}
												placeholder="UNTITLED_PROJECT"
												className="w-full bg-neutral-100 dark:bg-[#111] border-none rounded-md px-4 py-3 font-sans text-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:ring-0 focus:bg-neutral-50 dark:focus:bg-[#151515] transition-colors shadow-inner"
											/>
										</div>

										<div className="space-y-2">
											<Label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
												Operational Context
											</Label>
											<textarea
												value={description}
												onChange={(e) => setDescription(e.target.value)}
												placeholder="Add system notes..."
												className="w-full bg-neutral-100 dark:bg-[#111] border-none rounded-md px-4 py-3 font-sans text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:ring-0 focus:bg-neutral-50 dark:focus:bg-[#151515] transition-colors shadow-inner min-h-[120px] resize-none"
											/>
										</div>
									</div>
								</div>

								{/* Footer - MECHANICAL ACTION */}
								<div className="p-8 border-t border-neutral-100 dark:border-neutral-800">
									<button
										onClick={handleSubmit}
										disabled={isPending || !name.trim()}
										className="w-full h-14 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-md font-mono text-xs uppercase tracking-widest font-bold shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-3"
									>
										{isPending ? (
											<span className="animate-pulse">INITIALIZING...</span>
										) : (
											<>
												{mode === "create"
													? "Initialize System"
													: "Update System"}
												<SwissIcons.ArrowRight className="w-3 h-3" />
											</>
										)}
									</button>
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
												disabled={isPending || !name.trim()}
												className="flex-1 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-mono text-xs uppercase rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
											>
												{isPending ? (
													<div className="flex items-center gap-1">
														<span className="w-1 h-1 bg-current rounded-full animate-bounce" />
														<span className="w-1 h-1 bg-current rounded-full animate-bounce delay-75" />
														<span className="w-1 h-1 bg-current rounded-full animate-bounce delay-150" />
													</div>
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
													disabled={isPending || !name.trim()}
													className="h-10 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest rounded-sm shadow-sm transition-colors"
												>
													{isPending ? (
														<div className="flex gap-1">
															<div className="w-1 h-1 bg-current rounded-full animate-bounce" />
															<div className="w-1 h-1 bg-current rounded-full animate-bounce delay-75" />
														</div>
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
