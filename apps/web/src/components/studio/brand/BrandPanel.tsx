"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SwissIcons } from "@/components/ui/SwissIcons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { BrandAssetUpload } from "./BrandAssetUpload";

interface BrandPanelProps {
	isOpen: boolean;
	onClose: () => void;
	workspaceId: string;
	className?: string;
}

type PanelSector = "VISUAL" | "PALETTE" | "ARCHIVE";

export function BrandPanel({
	isOpen,
	onClose,
	workspaceId,
	className,
}: BrandPanelProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [activeSector, setActiveSector] = useState<PanelSector>("VISUAL");

	// Local state for instant preview feedback
	const [localFont, setLocalFont] = useState<string>("Cabinet Grotesk");
	const [localPrimary, setLocalPrimary] = useState<string>("#FF4D00");
	const [localAccent, setLocalAccent] = useState<string>("#00FF00");

	const { data: workspace, isLoading: isWorkspaceLoading } = useQuery(
		trpc.workspace.getById.queryOptions({
			id: workspaceId,
		}),
	);

	// Sync local state when workspace data loads
	useEffect(() => {
		if (workspace?.brandProfile) {
			const profile = workspace.brandProfile as any;
			setLocalFont(profile.fontFamily || "Cabinet Grotesk");
			setLocalPrimary(profile.primaryColor || "#FF4D00");
			setLocalAccent(profile.accentColor || "#00FF00");
		}
	}, [workspace]);

	const { data: brandAssets, isLoading: isAssetsLoading } = useQuery(
		trpc.workspace.getBrandAssets.queryOptions({
			workspaceId,
		}),
	);

	// Auto-clear status message after 3 seconds
	useEffect(() => {
		if (statusMessage) {
			const timer = setTimeout(() => setStatusMessage(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [statusMessage]);

	const updateWorkspace = useMutation(
		trpc.workspace.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(
					trpc.workspace.getById.queryFilter({ id: workspaceId }),
				);
				setStatusMessage("BRAND_DNA_UPDATED");
			},
			onError: (error) => {
				setStatusMessage(`UPDATE_ERROR: ${error.message.toUpperCase()}`);
			},
		}),
	);

	const deleteAsset = useMutation(
		trpc.asset.delete.mutationOptions({
			onMutate: () => {
				setStatusMessage("PURGING_ASSET...");
			},
			onSuccess: () => {
				queryClient.invalidateQueries(
					trpc.workspace.getBrandAssets.queryFilter({ workspaceId }),
				);
				setStatusMessage("ASSET_PURGED_SUCCESSFULLY");
			},
			onError: (error) => {
				setStatusMessage(`ERROR: ${error.message.toUpperCase()}`);
			},
		}),
	);

	const handleUpdate = (updates: any) => {
		// Immediately update local state for instant preview
		if (updates.fontFamily) setLocalFont(updates.fontFamily);
		if (updates.primaryColor) setLocalPrimary(updates.primaryColor);
		if (updates.accentColor) setLocalAccent(updates.accentColor);

		updateWorkspace.mutate({
			id: workspaceId,
			brandProfile: {
				primaryColor: localPrimary,
				accentColor: localAccent,
				fontFamily: localFont,
				...updates,
			},
		});
	};

	const FONT_OPTIONS = [
		{
			id: "Cabinet Grotesk",
			label: "Cabinet (Swiss Classic)",
			variable: "var(--font-cabinet)",
		},
		{
			id: "Satoshi",
			label: "Satoshi (Modern Sans)",
			variable: "var(--font-satoshi)",
		},
		{
			id: "IBM Plex Sans",
			label: "IBM Plex (Industrial)",
			variable: "var(--font-ibm-plex)",
		},
		{
			id: "JetBrains Mono",
			label: "JetBrains (Technical)",
			variable: "var(--font-jetbrains)",
		},
		{
			id: "Space Grotesk",
			label: "Space (Characterful)",
			variable: "var(--font-space)",
		},
	];

	const currentFontOption =
		FONT_OPTIONS.find((f) => f.id === localFont) || FONT_OPTIONS[0];

	const sectors: { id: PanelSector; label: string; icon: any }[] = [
		{ id: "VISUAL", label: "VISUAL", icon: SwissIcons.Type },
		{ id: "PALETTE", label: "PALETTE", icon: SwissIcons.Palette },
		{ id: "ARCHIVE", label: "ARCHIVE", icon: SwissIcons.Archive },
	];

	return (
		<div
			className={cn(
				"flex flex-col h-full bg-[#f4f4f0] dark:bg-[#0a0a0a] border-l border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden",
				className,
			)}
		>
			{/* Header - Simplified as requested */}
			<div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-[#f4f4f0] dark:bg-[#0a0a0a] shrink-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<SwissIcons.Brand size={16} className="text-[#FF4D00]" />
						<h2 className="font-sans text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white">
							Brand Archive
						</h2>
					</div>
					<button
						onClick={onClose}
						className="w-6 h-6 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors rounded-sm"
					>
						<SwissIcons.Close size={14} className="text-neutral-500" />
					</button>
				</div>
			</div>

			{/* Sub-Navigation (Tabs) */}
			<div className="flex bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-1 shrink-0">
				{sectors.map((sector) => (
					<button
						key={sector.id}
						onClick={() => setActiveSector(sector.id)}
						className={cn(
							"flex-1 py-2 text-[9px] font-mono uppercase tracking-widest transition-all rounded-[1px] relative flex items-center justify-center gap-2",
							activeSector === sector.id
								? "bg-white dark:bg-[#1a1a1a] text-[#FF4D00] font-bold shadow-sm"
								: "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
						)}
					>
						<sector.icon
							size={10}
							className={cn(
								activeSector === sector.id
									? "text-[#FF4D00]"
									: "text-neutral-400",
							)}
						/>
						{activeSector === sector.id && (
							<motion.div
								layoutId="panelTabIndicator"
								className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-[#FF4D00]"
							/>
						)}
						{sector.id}
					</button>
				))}
			</div>

			{/* Core Content Area */}
			<div className="flex-1 overflow-y-auto scrollbar-swiss relative">
				<AnimatePresence mode="wait">
					{activeSector === "VISUAL" && (
						<motion.div
							key="visual"
							initial={{ opacity: 0, x: 5 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -5 }}
							className="p-4 space-y-6"
						>
							<div className="space-y-4">
								<label className="font-mono text-[9px] uppercase text-neutral-400 tracking-widest block">
									Primary_Interface_Font
								</label>
								<Select
									value={localFont}
									onValueChange={(v) => handleUpdate({ fontFamily: v })}
								>
									<SelectTrigger className="h-9 font-mono uppercase text-[10px] tracking-widest bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-sm">
										<SelectValue placeholder="Select Font" />
									</SelectTrigger>
									<SelectContent className="bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-sm">
										{FONT_OPTIONS.map((option) => (
											<SelectItem key={option.id} value={option.id}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/40 rounded-sm overflow-hidden">
								<div className="flex justify-between items-start mb-6">
									<span className="font-mono text-[8px] text-neutral-400 uppercase">
										Preview
									</span>
									<span className="font-mono text-[8px] text-neutral-400 uppercase">
										{localFont.toUpperCase()}
									</span>
								</div>
								<motion.div
									key={localFont}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white mb-2"
									style={{ fontFamily: currentFontOption.variable }}
								>
									Aa Bb 01
								</motion.div>
								<p className="font-mono text-[9px] text-neutral-500 leading-relaxed uppercase opacity-50">
									The quick brown fox jumps over the lazy dog.
								</p>
							</div>
						</motion.div>
					)}

					{activeSector === "PALETTE" && (
						<motion.div
							key="palette"
							initial={{ opacity: 0, x: 5 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -5 }}
							className="p-4 space-y-6"
						>
							<CompactColorPicker
								label="PRIMARY"
								color={localPrimary}
								onChange={(c) => handleUpdate({ primaryColor: c })}
							/>
							<div className="h-px bg-neutral-200 dark:bg-neutral-800" />
							<CompactColorPicker
								label="ACCENT"
								color={localAccent}
								onChange={(c) => handleUpdate({ accentColor: c })}
							/>
						</motion.div>
					)}

					{activeSector === "ARCHIVE" && (
						<motion.div
							key="archive"
							initial={{ opacity: 0, x: 5 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -5 }}
							className="p-4 space-y-6"
						>
							<div className="grid grid-cols-2 gap-2">
								{brandAssets?.map((asset: any) => (
									<div
										key={asset.id}
										className="group relative aspect-square bg-white dark:bg-[#050505] border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden flex flex-col transition-all hover:border-[#FF4D00]"
									>
										<div className="flex-1 flex items-center justify-center p-2">
											<img
												src={asset.url}
												alt={asset.name}
												className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 scale-90 group-hover:scale-100"
											/>
										</div>
										<div className="p-1.5 border-t border-neutral-100 dark:border-neutral-900 flex justify-between items-center bg-neutral-50 dark:bg-black/20">
											<span className="font-mono text-[7px] text-neutral-400 uppercase truncate pr-2">
												{asset.name}
											</span>
											<button
												onClick={(e) => {
													e.stopPropagation();
													if (confirm("CONFIRM_PURGE?"))
														deleteAsset.mutate({ id: asset.id });
												}}
												className="text-neutral-300 hover:text-red-500 transition-colors"
											>
												<SwissIcons.Trash size={10} />
											</button>
										</div>
									</div>
								))}
								<div className="aspect-square">
									<BrandAssetUpload
										workspaceId={workspaceId}
										onStatusChange={setStatusMessage}
									/>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Footer - System Nodes */}
			<div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#050505] shrink-0">
				<div className="flex items-center justify-between opacity-50">
					<div className="flex items-center gap-2">
						<div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
						<span className="font-mono text-[8px] text-neutral-500 uppercase tracking-widest">
							Refinery_Sync_Stable
						</span>
					</div>
					<span className="font-mono text-[7px] text-neutral-400">
						NODE_LOCAL_OP
					</span>
				</div>
			</div>
		</div>
	);
}

function CompactColorPicker({
	label,
	color,
	onChange,
}: {
	label: string;
	color: string;
	onChange: (c: string) => void;
}) {
	const [inputValue, setInputValue] = useState(color);

	useEffect(() => {
		setInputValue(color);
	}, [color]);

	const handleInputChange = (val: string) => {
		setInputValue(val);
		if (/^#[0-9A-F]{6}$/i.test(val)) {
			onChange(val);
		}
	};

	return (
		<div className="space-y-2">
			<label className="font-mono text-[9px] uppercase text-neutral-400 tracking-widest block">
				{label}_SIGNAL
			</label>
			<div className="flex items-center gap-3">
				<Popover>
					<PopoverTrigger asChild>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="w-10 h-10 rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden shrink-0"
							style={{ backgroundColor: color }}
						>
							<div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/10 transition-opacity">
								<SwissIcons.Edit size={12} className="text-white" />
							</div>
						</motion.button>
					</PopoverTrigger>
					<PopoverContent
						className="w-fit p-4 bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800 rounded-sm shadow-2xl"
						side="right"
						sideOffset={10}
					>
						<div className="space-y-4">
							<HexColorPicker color={color} onChange={onChange} />
							<div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-900">
								<span className="font-mono text-[9px] text-neutral-400">
									HEX:
								</span>
								<input
									value={inputValue}
									onChange={(e) => handleInputChange(e.target.value)}
									className="bg-transparent font-mono text-[10px] uppercase focus:outline-none text-neutral-900 dark:text-white w-20"
								/>
							</div>
						</div>
					</PopoverContent>
				</Popover>
				<div className="flex-1 relative">
					<input
						value={inputValue.toUpperCase()}
						onChange={(e) => handleInputChange(e.target.value)}
						className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-sm font-mono text-[10px] uppercase text-neutral-900 dark:text-white tabular-nums tracking-widest focus:ring-1 focus:ring-[#FF4D00] outline-none transition-all"
					/>
				</div>
			</div>
		</div>
	);
}
