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
	onAddAsset?: (asset: { id: string; url: string; name: string }) => void;
}

type PanelSector = "VISUAL" | "PALETTE" | "ARCHIVE" | "INTELLIGENCE";

export function BrandPanel({
	isOpen,
	onClose,
	workspaceId,
	className,
	onAddAsset,
}: BrandPanelProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [activeSector, setActiveSector] = useState<PanelSector>("VISUAL");
	const [archiveFilter, setArchiveFilter] = useState<
		"ALL" | "IMAGE" | "DOCUMENT"
	>("ALL");

	// Local state for instant preview feedback
	const [localFont, setLocalFont] = useState<string>("Cabinet Grotesk");
	const [localPrimary, setLocalPrimary] = useState<string>("#111111");
	const [localAccent, setLocalAccent] = useState<string>("#888888");

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
			setLocalPrimary(profile.primaryColor || "#111111");
			setLocalAccent(profile.accentColor || "#888888");
		}
	}, [workspace]);

	const { data: brandAssets, isLoading: isAssetsLoading } = useQuery(
		trpc.workspace.getBrandAssets.queryOptions({
			workspaceId,
		}),
	);

	const { data: intelligence } = useQuery(
		trpc.workspace.getIntelligence.queryOptions({
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
				...((workspace?.brandProfile as any) || {}),
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
		{ id: "VISUAL", label: "Type", icon: SwissIcons.Type },
		{ id: "PALETTE", label: "Color", icon: SwissIcons.Palette },
		{ id: "ARCHIVE", label: "Marks", icon: SwissIcons.Archive },
		{ id: "INTELLIGENCE", label: "Index", icon: SwissIcons.Dna },
	];

	return (
		<div
			className={cn(
				"flex h-full bg-[#F4F4F0] dark:bg-[#0D0D0D] border-l border-neutral-200/50 dark:border-white/5 shadow-2xl overflow-hidden",
				className,
			)}
		>
			{/* Physical Toggle Rail */}
			<div className="w-16 flex flex-col items-center py-8 gap-6 shrink-0 bg-neutral-100/50 dark:bg-black/20">
				<div className="mb-8 opacity-20">
					<SwissIcons.Brand size={20} />
				</div>

				<div className="flex-1 flex flex-col gap-4 w-full items-center">
					{sectors.map((sector) => (
						<button
							key={sector.id}
							onClick={() => setActiveSector(sector.id)}
							className={cn(
								"w-10 h-10 flex items-center justify-center rounded-full transition-all relative",
								activeSector === sector.id
									? "bg-[#EBEBE7] dark:bg-[#1A1A1A] shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)]"
									: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300",
							)}
						>
							<sector.icon
								size={18}
								strokeWidth={1.5}
								className={cn(
									"transition-colors",
									activeSector === sector.id
										? "text-neutral-900 dark:text-white"
										: "text-neutral-400",
								)}
							/>

							{activeSector === sector.id && (
								<motion.div
									layoutId="braunLed"
									className="absolute -right-3 w-1 h-1 rounded-full bg-[#FF4D00] shadow-[0_0_4px_#ff4d00]"
								/>
							)}
						</button>
					))}
				</div>

				<button
					onClick={onClose}
					className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
				>
					<SwissIcons.Close size={18} strokeWidth={1} />
				</button>
			</div>

			{/* Operational Surface */}
			<div className="flex-1 flex flex-col min-w-0">
				{/* Discrete Header */}
				<div className="px-10 pt-10 pb-6 shrink-0">
					<div className="flex items-baseline justify-between">
						<h2 className="font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-neutral-900 dark:text-white opacity-80">
							{sectors.find((s) => s.id === activeSector)?.label}
						</h2>
						<span className="font-mono text-[9px] text-neutral-400 tabular-nums">
							{statusMessage
								? statusMessage
								: `REF_ID: ${workspaceId.slice(0, 6).toUpperCase()}`}
						</span>
					</div>
				</div>

				{/* Content: Clean Spacing */}
				<div className="flex-1 overflow-y-auto scrollbar-swiss px-10">
					<AnimatePresence mode="wait">
						{activeSector === "VISUAL" && (
							<motion.div
								key="visual"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="space-y-12 py-4"
							>
								<div className="space-y-4">
									<label className="font-sans text-[10px] uppercase text-neutral-400 tracking-wider">
										System Typeface
									</label>
									<Select
										value={localFont}
										onValueChange={(v) => handleUpdate({ fontFamily: v })}
									>
										<SelectTrigger className="h-12 bg-transparent border-neutral-200 dark:border-white/10 rounded-sm hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
											<SelectValue placeholder="Select" />
										</SelectTrigger>
										<SelectContent>
											{FONT_OPTIONS.map((option) => (
												<SelectItem key={option.id} value={option.id}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-4">
									<div
										className="text-[80px] font-black tracking-tighter leading-[0.9] text-neutral-900 dark:text-white"
										style={{ fontFamily: currentFontOption.variable }}
									>
										Aa
									</div>
									<div className="h-px w-12 bg-[#FF4D00]" />
									<p className="font-sans text-[11px] text-neutral-500 leading-relaxed uppercase max-w-[240px]">
										{localFont} / Universal semantic alignment across the
										creative cortex.
									</p>
								</div>
							</motion.div>
						)}

						{activeSector === "PALETTE" && (
							<motion.div
								key="palette"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="space-y-10 py-4"
							>
								<div className="grid grid-cols-1 gap-10">
									<BraunColorSetting
										label="Primary"
										color={localPrimary}
										onChange={(c) => handleUpdate({ primaryColor: c })}
									/>
									<BraunColorSetting
										label="Accent"
										color={localAccent}
										onChange={(c) => handleUpdate({ accentColor: c })}
									/>
								</div>
							</motion.div>
						)}

						{activeSector === "ARCHIVE" && (
							<motion.div
								key="archive"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="space-y-8 py-4"
							>
								{/* Filter Pill */}
								<div className="flex gap-4 border-b border-neutral-100 dark:border-white/5 pb-4">
									{(["ALL", "IMAGE", "DOCUMENT"] as const).map((filter) => (
										<button
											key={filter}
											onClick={() => setArchiveFilter(filter)}
											className={cn(
												"font-sans text-[10px] uppercase tracking-wider transition-opacity",
												archiveFilter === filter
													? "text-[#FF4D00] font-medium"
													: "text-neutral-400 hover:opacity-100 opacity-60",
											)}
										>
											{filter}
										</button>
									))}
								</div>

								<div className="grid grid-cols-2 gap-6">
									{brandAssets
										?.filter(
											(a) =>
												archiveFilter === "ALL" ||
												(archiveFilter === "IMAGE"
													? a.type === "IMAGE"
													: a.type === "DOCUMENT"),
										)
										.map((asset: any) => (
											<div
												key={asset.id}
												draggable={asset.type === "IMAGE"}
												onDragStart={(e) =>
													e.dataTransfer.setData(
														"application/studio-asset",
														JSON.stringify(asset),
													)
												}
												onClick={() =>
													asset.type === "IMAGE" && onAddAsset?.(asset)
												}
												className="group space-y-3 cursor-pointer"
											>
												<div className="aspect-square bg-neutral-100/50 dark:bg-white/5 rounded-sm flex items-center justify-center p-6 transition-all group-hover:bg-[#EBEBE7] dark:group-hover:bg-white/10 group-hover:shadow-sm">
													{asset.type === "DOCUMENT" ? (
														<SwissIcons.Archive
															size={32}
															strokeWidth={1}
															className="text-neutral-300"
														/>
													) : (
														<img
															src={asset.url}
															alt={asset.name}
															className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
														/>
													)}
												</div>
												<div className="flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
													<span className="font-mono text-[8px] uppercase truncate">
														{asset.name}
													</span>
													<button
														onClick={(e) => {
															e.stopPropagation();
															if (confirm("PURGE?"))
																deleteAsset.mutate({ id: asset.id });
														}}
													>
														<SwissIcons.Trash size={10} />
													</button>
												</div>
											</div>
										))}
									<div className="aspect-square flex items-center justify-center border border-dashed border-neutral-200 dark:border-white/10 rounded-sm">
										<BrandAssetUpload
											workspaceId={workspaceId}
											onStatusChange={setStatusMessage}
										/>
									</div>
								</div>
							</motion.div>
						)}

						{activeSector === "INTELLIGENCE" && (
							<motion.div
								key="intel"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="space-y-12 py-4"
							>
								<div className="space-y-2">
									<div className="flex items-center gap-2 mb-4">
										<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
										<span className="font-sans text-[10px] uppercase tracking-widest text-neutral-400">
											Cortex_Active
										</span>
									</div>
									<div className="text-6xl font-black tracking-tighter text-neutral-900 dark:text-white">
										{intelligence?.totalNodes || 0}
									</div>
									<div className="font-mono text-[9px] uppercase text-neutral-400">
										Technical_Nodes_Indexed
									</div>
								</div>

								<div className="space-y-4">
									<span className="font-sans text-[10px] uppercase text-neutral-400 tracking-wider">
										Source_Readout
									</span>
									<div className="space-y-px">
										{intelligence?.sources?.map((source: any, i: number) => (
											<div
												key={i}
												className="flex justify-between py-3 border-b border-neutral-100 dark:border-white/5"
											>
												<span className="font-mono text-[9px] uppercase text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]">
													{source.name}
												</span>
												<span className="font-mono text-[9px] text-[#FF4D00]">
													[{source.nodeCount}]
												</span>
											</div>
										))}
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Footer: Node Telemetry */}
				<div className="px-10 py-3 border-t border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-black/20 shrink-0">
					<div className="flex items-center justify-between opacity-40">
						<div className="flex items-center gap-2">
							<div className="w-1 h-1 rounded-full bg-[#FF4D00]" />
							<span className="font-mono text-[8px] text-neutral-500 uppercase tracking-widest">
								System_Link_Active
							</span>
						</div>
						<span className="font-mono text-[7px] text-neutral-400 uppercase">
							Workspace_{workspaceId.slice(0, 8)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function BraunColorSetting({
	label,
	color,
	onChange,
}: {
	label: string;
	color: string;
	onChange: (c: string) => void;
}) {
	const [val, setVal] = useState(color);
	useEffect(() => setVal(color), [color]);

	return (
		<div className="flex items-center justify-between group">
			<div className="space-y-1">
				<span className="font-sans text-[11px] font-medium uppercase text-neutral-900 dark:text-white opacity-80">
					{label}
				</span>
				<div className="font-mono text-[10px] text-neutral-400 uppercase tracking-tighter">
					{val}
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Popover>
					<PopoverTrigger asChild>
						<button
							className="w-12 h-12 rounded-full border border-neutral-200 dark:border-white/10 shadow-sm transition-transform hover:scale-105 active:scale-95"
							style={{ backgroundColor: color }}
						/>
					</PopoverTrigger>
					<PopoverContent
						side="left"
						className="w-fit p-6 bg-[#F4F4F0] dark:bg-[#0D0D0D] border-neutral-200 dark:border-white/10 shadow-2xl rounded-sm"
					>
						<HexColorPicker color={color} onChange={onChange} />
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
