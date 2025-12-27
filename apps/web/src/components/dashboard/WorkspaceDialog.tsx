"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Label } from "@/components/ui/label";
import { SwissIcons } from "@/components/ui/SwissIcons";

interface WorkspaceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode?: "create" | "edit";
	initialData?: {
		name?: string;
		description?: string;
	};
	onSubmit: (data: {
		name: string;
		description: string;
		brandProfile?: {
			primaryColor: string;
			accentColor: string;
			fontFamily: string;
		};
	}) => void;
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
	const [primaryColor, setPrimaryColor] = useState("#FF4D00");
	const [accentColor, setAccentColor] = useState("#00FF00");
	const [fontFamily, setFontFamily] = useState("Inter"); // Standardish for now
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
		onSubmit({
			name,
			description,
			brandProfile: {
				primaryColor,
				accentColor,
				fontFamily,
			},
		});
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
						className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[4px] z-[9998]"
					/>

					{/* Dialog Panel - CONTROL DECK AESTHETIC */}
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
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
										INITIALIZE
									</span>
								</div>
							</div>
							<div className="flex items-end justify-between">
								<h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
									Workspace
								</h1>
								<SwissIcons.Layout size={24} className="text-neutral-400" />
							</div>
						</div>

						{/* Content - CLEAN FORM */}
						<div className="flex-1 p-8 space-y-8 overflow-y-auto">
							<div className="space-y-6">
								<div className="space-y-2">
									<Label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
										Workspace Name
									</Label>
									<input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="My Workspace"
										className="w-full bg-neutral-100 dark:bg-[#111] border-none rounded-md px-4 py-3 font-sans text-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:ring-0 focus:bg-neutral-50 dark:focus:bg-[#151515] transition-colors shadow-inner"
									/>
								</div>

								<div className="space-y-2">
									<Label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
										Description
									</Label>
									<textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Add context about this workspace..."
										className="w-full bg-neutral-100 dark:bg-[#111] border-none rounded-md px-4 py-3 font-sans text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:ring-0 focus:bg-neutral-50 dark:focus:bg-[#151515] transition-colors shadow-inner min-h-[120px] resize-none"
									/>
								</div>

								{/* BRAND IDENTITY SECTION */}
								<div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-6">
									<div className="flex items-center gap-2">
										<div className="w-1 h-3 bg-[#FF4D00]" />
										<span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
											Brand DNA
										</span>
									</div>

									<div className="space-y-4">
										<Label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
											Primary Palette
										</Label>
										<div className="flex gap-4">
											<div className="flex flex-col gap-2">
												<div
													className="w-16 h-16 rounded-sm shadow-inner cursor-pointer border border-neutral-200 dark:border-neutral-800 relative group"
													style={{ backgroundColor: primaryColor }}
												>
													<input
														type="color"
														value={primaryColor}
														onChange={(e) => setPrimaryColor(e.target.value)}
														className="absolute inset-0 opacity-0 cursor-pointer"
													/>
													<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
														<SwissIcons.Edit size={12} className="text-white" />
													</div>
												</div>
												<span className="font-mono text-[9px] text-center text-neutral-400">
													{primaryColor.toUpperCase()}
												</span>
											</div>

											<div className="flex flex-col gap-2">
												<div
													className="w-16 h-16 rounded-sm shadow-inner cursor-pointer border border-neutral-200 dark:border-neutral-800 relative group"
													style={{ backgroundColor: accentColor }}
												>
													<input
														type="color"
														value={accentColor}
														onChange={(e) => setAccentColor(e.target.value)}
														className="absolute inset-0 opacity-0 cursor-pointer"
													/>
													<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
														<SwissIcons.Edit size={12} className="text-white" />
													</div>
												</div>
												<span className="font-mono text-[9px] text-center text-neutral-400">
													{accentColor.toUpperCase()}
												</span>
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<Label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
											Type Interface
										</Label>
										<select
											value={fontFamily}
											onChange={(e) => setFontFamily(e.target.value)}
											className="w-full bg-neutral-100 dark:bg-[#111] border-none rounded-md px-4 py-3 font-mono text-xs text-neutral-900 dark:text-white focus:ring-0 focus:bg-neutral-50 dark:focus:bg-[#151515] transition-colors shadow-inner"
										>
											<option value="Inter">INTER (ACCESSIBLE)</option>
											<option value="IBM Plex Mono">
												PLEX MONO (INDUSTRIAL)
											</option>
											<option value="Space Grotesk">GROTESK (MODERN)</option>
											<option value="Uncut Sans">UNCUT (SWISS)</option>
										</select>
									</div>
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
											? "Initialize Workspace"
											: "Update System"}
										<SwissIcons.ArrowRight className="w-3 h-3" />
									</>
								)}
							</button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);

	return createPortal(dialogContent, document.body);
}
