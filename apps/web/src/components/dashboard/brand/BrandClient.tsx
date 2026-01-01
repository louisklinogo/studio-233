"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { BrandAssetUpload } from "@/components/studio/brand/BrandAssetUpload";
import { BraunAssetStaging } from "@/components/ui/BraunAssetStaging";
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

interface BrandClientProps {
	workspaceId: string;
}

// Reusable "Control Panel" Section - Matching Settings Style exactly
function BrandSection({
	title,
	children,
	description,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<motion.section
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
			className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-8 rounded-sm space-y-6 flex-1 overflow-y-auto scrollbar-swiss shadow-sm"
		>
			<div className="flex flex-col gap-1 border-b border-neutral-100 dark:border-neutral-800 pb-4">
				<h3 className="font-mono text-sm uppercase tracking-widest font-bold text-neutral-900 dark:text-white">
					{title}
				</h3>
				{description && (
					<p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-prose">
						{description}
					</p>
				)}
			</div>
			<div className="space-y-6">{children}</div>
		</motion.section>
	);
}

// Custom Braun-inspired Color Picker Component
function BraunColorPicker({
	color,
	onChange,
	label,
	id,
}: {
	color: string;
	onChange: (c: string) => void;
	label: string;
	id: string;
}) {
	const [inputValue, setInputValue] = useState(color);

	useEffect(() => {
		setInputValue(color);
	}, [color]);

	return (
		<div className="flex items-center gap-8 group">
			<div className="space-y-1 w-32">
				<span className="font-mono text-[8px] text-neutral-400 uppercase tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">
					NODE_{id}
				</span>
				<label className="font-mono text-[10px] uppercase text-neutral-500 tracking-wider block font-bold">
					{label}
				</label>
			</div>

			<div className="flex-1 flex items-center gap-4">
				<Popover>
					<PopoverTrigger asChild>
						<motion.div
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="w-12 h-12 border border-neutral-200 dark:border-neutral-800 rounded-sm relative cursor-pointer group-hover:border-[#FF4D00] transition-colors shadow-sm shrink-0"
							style={{ backgroundColor: color }}
						>
							<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
								<SwissIcons.Edit
									size={14}
									className="text-white drop-shadow-md"
								/>
							</div>
						</motion.div>
					</PopoverTrigger>
					<PopoverContent className="w-fit p-4 bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800 rounded-sm shadow-2xl">
						<div className="space-y-4 custom-color-picker">
							<HexColorPicker color={color} onChange={onChange} />
							<div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-900">
								<span className="font-mono text-[10px] text-neutral-400">
									HEX:
								</span>
								<input
									value={inputValue}
									onChange={(e) => {
										setInputValue(e.target.value);
										if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
											onChange(e.target.value);
										}
									}}
									className="bg-transparent font-mono text-xs uppercase focus:outline-none text-neutral-900 dark:text-white w-20"
								/>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				<div className="flex-1 relative">
					<input
						value={inputValue}
						onChange={(e) => {
							setInputValue(e.target.value);
							if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
								onChange(e.target.value);
							}
						}}
						className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 px-4 py-2.5 rounded-sm font-mono text-[11px] uppercase text-neutral-900 dark:text-white tabular-nums tracking-widest focus:ring-1 focus:ring-[#FF4D00] outline-none transition-all"
					/>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
						<div
							className="w-1.5 h-1.5 rounded-full"
							style={{ backgroundColor: color }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

// Operational Note - Technical context for the user
function OperationalNote({ message }: { message: string }) {
	return (
		<div className="flex items-center gap-3 px-4 py-2 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-neutral-800 rounded-sm">
			<SwissIcons.Sparkles className="text-[#FF4D00] shrink-0" size={12} />
			<p className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider leading-tight">
				{message}
			</p>
		</div>
	);
}

type BrandSector = "VISUAL" | "PALETTE" | "ARCHIVE" | "INTELLIGENCE";

// Font Mapping - Connects friendly names to project-level CSS variables
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
] as const;

export function BrandClient({ workspaceId }: BrandClientProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [activeSector, setActiveSector] = useState<BrandSector>("VISUAL");
	const [archiveFilter, setArchiveFilter] = useState<
		"ALL" | "IMAGE" | "DOCUMENT"
	>("ALL");
	const [isPolling, setIsPolling] = useState(false);

	// Local state for instant preview feedback
	const [localFont, setLocalFont] = useState<string>("Cabinet Grotesk");
	const [localPrimary, setLocalPrimary] = useState<string>("#111111");
	const [localAccent, setLocalAccent] = useState<string>("#888888");

	const { data: workspace } = useQuery(
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

	const { data: intelligence, isLoading: isIntellLoading } = useQuery(
		trpc.workspace.getIntelligence.queryOptions(
			{
				workspaceId,
			},
			{
				refetchInterval: isPolling ? 3000 : false,
			},
		),
	);

	const updateWorkspace = useMutation(
		trpc.workspace.update.mutationOptions({
			onMutate: async (variables) => {
				// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
				const queryKey = trpc.workspace.getById.queryFilter({
					id: workspaceId,
				});
				await queryClient.cancelQueries(queryKey);

				// Snapshot the previous value
				const previousWorkspace = queryClient.getQueryData(
					trpc.workspace.getById.queryKey({ id: workspaceId }),
				);

				// Optimistically update to the new value
				if (previousWorkspace) {
					queryClient.setQueryData(
						trpc.workspace.getById.queryKey({ id: workspaceId }),
						{
							...previousWorkspace,
							brandProfile: {
								...(previousWorkspace.brandProfile as any),
								...variables.brandProfile,
							},
						},
					);
				}

				return { previousWorkspace };
			},
			onError: (err, variables, context) => {
				// Rollback to the previous value if mutation fails
				if (context?.previousWorkspace) {
					queryClient.setQueryData(
						trpc.workspace.getById.queryKey({ id: workspaceId }),
						context.previousWorkspace,
					);
				}
				setStatusMessage("SYNC_FAULT_DETECTED");
				console.error("Mutation failed:", err);
			},
			onSuccess: () => {
				setStatusMessage("BRAND_DNA_SYNCHRONIZED");
			},
			onSettled: () => {
				// Always refetch after error or success to ensure we are in sync with server
				queryClient.invalidateQueries(
					trpc.workspace.getById.queryFilter({ id: workspaceId }),
				);
			},
		}),
	);

	const deleteAsset = useMutation(
		trpc.asset.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(
					trpc.workspace.getBrandAssets.queryFilter({ workspaceId }),
				);
			},
		}),
	);

	const syncArchive = useMutation(
		trpc.workspace.syncArchive.mutationOptions({
			onSuccess: (data) => {
				setStatusMessage(`SYNC_TRIGGERED:_${data.triggeredSync}_NODES`);
				setIsPolling(true);
				// Stop polling after 30 seconds (typical max indexing time)
				setTimeout(() => setIsPolling(false), 30000);
				queryClient.invalidateQueries(
					trpc.workspace.getIntelligence.queryFilter({ workspaceId }),
				);
			},
			onError: () => {
				setStatusMessage("SYNC_ENGINE_FAULT");
				setIsPolling(false);
			},
		}),
	);

	const brandProfile = (workspace?.brandProfile as any) || {};
	const hasLogo = brandAssets && brandAssets.length > 0;
	const isInitialized = hasLogo && localPrimary && localFont;

	const handleUpdate = (updates: any) => {
		// Immediately update local state for instant preview
		if (updates.fontFamily) setLocalFont(updates.fontFamily);
		if (updates.primaryColor) setLocalPrimary(updates.primaryColor);
		if (updates.accentColor) setLocalAccent(updates.accentColor);

		updateWorkspace.mutate({
			id: workspaceId,
			brandProfile: {
				...brandProfile,
				...updates,
			},
		});
	};

	const currentFontOption =
		FONT_OPTIONS.find((f) => f.id === localFont) || FONT_OPTIONS[0];

	const SECTORS = [
		{ id: "VISUAL", label: "01_VISUAL_LANGUAGE", icon: SwissIcons.Type },
		{ id: "PALETTE", label: "02_CORE_PALETTE", icon: SwissIcons.Palette },
		{ id: "ARCHIVE", label: "03_ASSET_ARCHIVE", icon: SwissIcons.Archive },
		{ id: "INTELLIGENCE", label: "04_SYSTEM_KNOWLEDGE", icon: SwissIcons.Dna },
	] as const;

	return (
		<div className="h-[calc(100vh-160px)] flex flex-col space-y-8">
			{/* Header - Fixed to 3xl/Bold standard */}
			<header className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6 shrink-0">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<SwissIcons.Dna className="text-[#FF4D00]" size={16} />
						<span className="font-mono text-xs tracking-[0.3em] text-[#FF4D00]">
							SYSTEM_BRAND_DNA
						</span>
					</div>
					<h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
						Configure Brand Archive
					</h1>
				</div>
				<div className="flex flex-col items-end gap-2">
					<div className="flex items-center gap-3 px-3 py-1.5 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-sm">
						{statusMessage ? (
							<div className="flex items-center gap-2">
								<div
									className={cn(
										"w-1.5 h-1.5 rounded-full",
										statusMessage.includes("FAILURE") ||
											statusMessage.includes("FAULT")
											? "bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"
											: "bg-[#FF4D00] shadow-[0_0_8px_#ff4d00] animate-pulse",
									)}
								/>
								<span
									className={cn(
										"font-mono text-[9px] uppercase tracking-widest",
										statusMessage.includes("FAILURE") ||
											statusMessage.includes("FAULT")
											? "text-red-500 font-bold"
											: "text-[#FF4D00]",
									)}
								>
									{statusMessage}
								</span>
							</div>
						) : (
							<div className="flex items-center gap-2 opacity-40">
								<div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
								<span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
									SYSTEM_READY // V1.0.4-ARCH
								</span>
							</div>
						)}
					</div>

					<div className="hidden md:flex flex-col items-end gap-1">
						<div className="flex items-center gap-2">
							<div
								className={cn(
									"w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]",
									isInitialized && "animate-pulse",
								)}
							/>
							<span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
								{isInitialized ? "ACTIVE_SYNC" : "OFFLINE_PEND"}
							</span>
						</div>
						<div className="font-mono text-[10px] text-neutral-400 uppercase">
							REF: {workspaceId.toUpperCase().slice(0, 12)}
						</div>
					</div>
				</div>
			</header>
			{/* Terminal Chassis */}
			<div className="flex-1 flex gap-8 overflow-hidden">
				{/* Left Nav (Sector Selector) */}
				<nav className="w-64 flex flex-col gap-px bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden shrink-0 h-fit shadow-sm relative">
					{SECTORS.map((sector) => {
						const Icon = sector.icon;
						const isActive = activeSector === sector.id;
						return (
							<button
								key={sector.id}
								onClick={() => setActiveSector(sector.id)}
								className={cn(
									"flex items-center gap-4 px-6 py-5 font-mono text-[10px] uppercase tracking-widest transition-all text-left relative",
									isActive
										? "bg-white dark:bg-[#1a1a1a] text-[#FF4D00] font-bold"
										: "bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-500 hover:bg-white dark:hover:bg-[#111] hover:text-neutral-900 dark:hover:text-white",
								)}
							>
								<div className="absolute left-0 w-1 h-full flex items-center">
									{isActive && (
										<motion.div
											layoutId="activeSectorLed"
											className="w-1 h-6 bg-[#FF4D00] rounded-r-full shadow-[0_0_8px_rgba(255,77,0,0.5)]"
										/>
									)}
								</div>
								<Icon
									size={14}
									className={cn(
										"transition-colors",
										isActive ? "text-[#FF4D00]" : "text-neutral-400",
									)}
								/>
								{sector.label}
							</button>
						);
					})}
				</nav>

				{/* Right Content Panel */}
				<div className="flex-1 flex flex-col min-w-0 relative">
					<AnimatePresence mode="wait">
						{activeSector === "VISUAL" && (
							<BrandSection
								key="visual"
								title="Visual Language"
								description="Core typographic parameters. Your brand profile is automatically indexed into the RAG engine for all creative generation requests."
							>
								<div className="space-y-10">
									<div className="max-w-md space-y-4">
										<label className="font-mono text-[10px] uppercase text-neutral-500 tracking-wider block">
											Primary Interface Font
										</label>
										<Select
											value={localFont}
											onValueChange={(v) => handleUpdate({ fontFamily: v })}
										>
											<SelectTrigger className="h-10 font-mono uppercase text-[11px] tracking-widest bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-sm">
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
										<OperationalNote message="This font serves as the base for all AI-generated UI layouts and typography-heavy assets." />
									</div>

									<div className="p-10 border border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-sm">
										<div className="flex justify-between items-start mb-10">
											<span className="font-mono text-[9px] text-neutral-400 uppercase">
												Specimen_Preview
											</span>
											<span className="font-mono text-[9px] text-neutral-400 uppercase">
												UTF-8 / {localFont.toUpperCase()}
											</span>
										</div>
										<motion.div
											key={localFont}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											className="text-6xl font-black tracking-tighter text-neutral-900 dark:text-white mb-6"
											style={{ fontFamily: currentFontOption.variable }}
										>
											Aa Bb Cc 01
										</motion.div>
										<p className="font-mono text-[11px] text-neutral-500 leading-relaxed uppercase opacity-50 max-w-sm">
											The quick brown fox jumps over the lazy dog. Designers use
											this text to verify character spacing.
										</p>
									</div>
								</div>
							</BrandSection>
						)}

						{activeSector === "PALETTE" && (
							<BrandSection
								key="palette"
								title="Core Palette"
								description="Master signal colors used for high-fidelity component styling and brand-aligned asset generation."
							>
								<div className="space-y-8 max-w-2xl">
									<BraunColorPicker
										label="System Primary"
										color={localPrimary}
										id="PRIM"
										onChange={(c) => handleUpdate({ primaryColor: c })}
									/>
									<div className="h-px bg-neutral-100 dark:bg-neutral-900" />
									<BraunColorPicker
										label="Accent Signal"
										color={localAccent}
										id="ACC"
										onChange={(c) => handleUpdate({ accentColor: c })}
									/>
									<OperationalNote message="Primary and accent signals are injected into generation prompts to ensure global color consistency." />
								</div>
							</BrandSection>
						)}

						{activeSector === "ARCHIVE" && (
							<BrandSection
								key="archive"
								title="Asset Archive"
								description="Logo variations and brand marks indexed for the RAG engine. Context_Assets: LINKED"
							>
								<div className="space-y-8">
									{/* Archive Control Bar */}
									<div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4">
										<div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-sm">
											{(["ALL", "IMAGE", "DOCUMENT"] as const).map((filter) => (
												<button
													key={filter}
													onClick={() => setArchiveFilter(filter)}
													className={cn(
														"px-4 py-1.5 font-mono text-[9px] uppercase tracking-widest rounded-[1px] transition-all",
														archiveFilter === filter
															? "bg-white dark:bg-[#1a1a1a] text-[#FF4D00] shadow-sm font-bold"
															: "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
													)}
												>
													{filter === "ALL"
														? "SYSTEM_TOTAL"
														: filter === "IMAGE"
															? "ID_MARKS"
															: "RULEBOOKS"}
												</button>
											))}
										</div>
										<div className="font-mono text-[9px] text-neutral-400">
											NODE_COUNT:{" "}
											{brandAssets?.filter(
												(a) =>
													archiveFilter === "ALL" ||
													(archiveFilter === "IMAGE"
														? a.type === "IMAGE"
														: a.type === "DOCUMENT"),
											).length || 0}
										</div>
									</div>

									{!hasLogo && !isAssetsLoading && (
										<div className="group p-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm flex flex-col items-center justify-center text-center space-y-6 bg-neutral-50/30 dark:bg-white/5 transition-colors hover:bg-neutral-50/50 dark:hover:bg-white/10">
											{/* The Staging Asset */}
											<div className="relative">
												<BraunAssetStaging />
											</div>
											<div className="max-w-md space-y-2">
												<h3 className="font-sans text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest">
													DNA_PRIORS_NOT_SET
												</h3>
												<p className="font-mono text-[10px] text-neutral-500 uppercase leading-relaxed">
													Stylistic Sync Deficiency detected. The RAG engine
													requires at least one brand mark to establish visual
													anchoring. Initialize system by uploading a primary
													logo.
												</p>
											</div>
										</div>
									)}
									<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-neutral-100 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-900 overflow-hidden rounded-sm">
										{brandAssets
											?.filter(
												(asset) =>
													archiveFilter === "ALL" ||
													(archiveFilter === "IMAGE"
														? asset.type === "IMAGE"
														: asset.type === "DOCUMENT"),
											)
											.map((asset: any, idx: number) => (
												<motion.div
													key={asset.id}
													initial={{ opacity: 0, scale: 0.95 }}
													animate={{ opacity: 1, scale: 1 }}
													transition={{ delay: idx * 0.05 }}
													className="group relative aspect-square bg-white dark:bg-[#050505] flex flex-col p-4 transition-all hover:z-10 hover:shadow-2xl"
												>
													<div className="flex-1 flex items-center justify-center overflow-hidden mb-4 p-2">
														{asset.type === "DOCUMENT" ? (
															<div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-neutral-50 dark:bg-neutral-900/50 rounded-sm">
																<SwissIcons.Archive
																	size={32}
																	className="text-neutral-300"
																/>
																<span className="font-mono text-[8px] text-neutral-400">
																	GUIDE_PDF
																</span>
															</div>
														) : (
															<img
																src={asset.url}
																alt={asset.name}
																className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 scale-90 group-hover:scale-100"
															/>
														)}
													</div>
													<div className="space-y-2 pt-2 border-t border-neutral-50 dark:border-neutral-900">
														<div className="flex justify-between items-start">
															<span className="font-mono text-[8px] text-neutral-400 uppercase tracking-tighter">
																REF:{asset.id.slice(0, 6)}
															</span>
															<button
																onClick={() =>
																	deleteAsset.mutate({ id: asset.id })
																}
																className="text-neutral-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
															>
																<SwissIcons.Trash size={10} />
															</button>
														</div>
														<span className="font-mono text-[9px] text-neutral-600 dark:text-neutral-400 uppercase truncate block font-bold tracking-tight">
															{asset.name.split(".")[0]}
														</span>
													</div>
													{/* Corner Accents */}
													<div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-neutral-200 dark:border-neutral-800 opacity-50" />
													<div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-neutral-200 dark:border-neutral-800 opacity-50 group-hover:border-[#FF4D00] group-hover:opacity-100" />
												</motion.div>
											))}

										<div className="aspect-square bg-neutral-50 dark:bg-[#0a0a0a] flex items-center justify-center">
											<div className="w-full h-full p-4">
												<BrandAssetUpload
													workspaceId={workspaceId}
													onStatusChange={setStatusMessage}
												/>
											</div>
										</div>
									</div>

									<OperationalNote message="Uploaded assets are automatically vector-indexed for high-fidelity brand recall during agentic generation." />
								</div>
							</BrandSection>
						)}

						{activeSector === "INTELLIGENCE" && (
							<BrandSection
								key="intelligence"
								title="System Knowledge Hub"
								description="Technical readout of the RAG (Retrieval-Augmented Generation) cortex. This data is used to provide agents with brand-safe autonomous reasoning."
							>
								{/* 01. Brand Manifesto Hero Card */}
								{intelligence?.brandSummary && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										className="mb-8 p-10 bg-neutral-900 text-white rounded-sm relative overflow-hidden group"
									>
										{/* Corner Accents */}
										<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FF4D00]" />
										<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FF4D00]" />

										<div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
											<div className="lg:col-span-8 space-y-6">
												<div className="flex items-center gap-3">
													<SwissIcons.Dna
														className="text-[#FF4D00]"
														size={16}
													/>
													<span className="font-mono text-[10px] tracking-[0.4em] text-[#FF4D00] uppercase">
														System_Deduction_Identity
													</span>
												</div>
												<h2 className="text-4xl font-black tracking-tighter leading-[0.9] uppercase italic">
													{intelligence.brandSummary.manifesto}
												</h2>
												<div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
													<div className="space-y-1">
														<span className="font-mono text-[8px] text-neutral-500 uppercase tracking-widest block">
															Voice_Tone
														</span>
														<div className="flex gap-2">
															{intelligence.brandSummary.voice.map(
																(v: string) => (
																	<span
																		key={v}
																		className="font-mono text-[10px] text-neutral-300 uppercase"
																	>
																		// {v}
																	</span>
																),
															)}
														</div>
													</div>
													<div className="w-px h-8 bg-white/10 hidden md:block" />
													<div className="space-y-1">
														<span className="font-mono text-[8px] text-neutral-500 uppercase tracking-widest block">
															Visual_Aesthetic
														</span>
														<div className="flex gap-2">
															{intelligence.brandSummary.visual_dna.map(
																(v: string) => (
																	<span
																		key={v}
																		className="font-mono text-[10px] text-neutral-300 uppercase"
																	>
																		// {v}
																	</span>
																),
															)}
														</div>
													</div>
												</div>
											</div>

											<div className="lg:col-span-4 space-y-6">
												<span className="font-mono text-[8px] text-neutral-500 uppercase tracking-widest block border-b border-white/10 pb-2">
													Core_Principles
												</span>
												<div className="space-y-4">
													{intelligence.brandSummary.principles.map(
														(p: any, i: number) => (
															<div key={i} className="space-y-1">
																<div className="flex items-center gap-2">
																	<span className="font-mono text-[10px] text-[#FF4D00]">
																		0{i + 1}
																	</span>
																	<h4 className="font-mono text-[10px] font-bold uppercase tracking-wider">
																		{p.title}
																	</h4>
																</div>
																<p className="text-[10px] text-neutral-400 leading-snug">
																	{p.description}
																</p>
															</div>
														),
													)}
												</div>
											</div>
										</div>

										{/* Subtle Grid Background */}
										<div className="absolute inset-0 opacity-[0.05] pointer-events-none grid grid-cols-12 grid-rows-6">
											{Array.from({ length: 72 }).map((_, i) => (
												<div key={i} className="border-[0.5px] border-white" />
											))}
										</div>
									</motion.div>
								)}

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									{/* Vector Health Status */}
									<div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black rounded-sm space-y-6">
										<div className="flex items-center justify-between">
											<span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
												VEC_HEALTH_AUDIT
											</span>
											<div
												className={cn(
													"flex items-center gap-2 px-2 py-0.5 rounded-full border text-[8px] font-mono",
													isPolling
														? "border-amber-500/20 text-amber-500 bg-amber-500/5"
														: intelligence?.systemState === "STABLE"
															? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
															: "border-neutral-500/20 text-neutral-500 bg-neutral-500/5",
												)}
											>
												<div
													className={cn(
														"w-1 h-1 rounded-full",
														isPolling
															? "bg-amber-500 animate-pulse"
															: intelligence?.systemState === "STABLE"
																? "bg-emerald-500 animate-pulse"
																: "bg-neutral-500",
													)}
												/>
												{isPolling
													? "INDEXING"
													: intelligence?.systemState || "OFFLINE"}
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex items-end justify-between">
												<div className="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white flex items-baseline gap-2">
													{intelligence?.totalNodes || 0}
													<span className="text-xs font-mono text-neutral-400 uppercase tracking-normal">
														Nodes_Indexed
													</span>
												</div>
												<button
													onClick={() => syncArchive.mutate({ workspaceId })}
													disabled={syncArchive.isPending || isPolling}
													className="mb-1 px-3 py-1 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-mono text-[8px] uppercase tracking-[0.2em] font-bold rounded-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
												>
													{syncArchive.isPending || isPolling ? (
														<SwissIcons.Spinner
															className="animate-spin"
															size={8}
														/>
													) : (
														<SwissIcons.Refresh size={8} />
													)}
													Synchronize
												</button>
											</div>
											<div className="h-1 w-full bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
												<motion.div
													initial={{ width: 0 }}
													animate={{
														width: intelligence?.totalNodes ? "100%" : "0%",
													}}
													className={cn(
														"h-full transition-colors duration-500",
														isPolling ? "bg-amber-500" : "bg-[#FF4D00]",
													)}
												/>
											</div>
										</div>

										<div className="pt-4 border-t border-neutral-100 dark:border-neutral-900">
											<div className="bg-neutral-100 dark:bg-white/5 p-4 rounded-sm border border-neutral-200 dark:border-neutral-800">
												<span className="font-mono text-[8px] text-neutral-400 uppercase block mb-1">
													DEDUCED_AESTHETIC_DNA:
												</span>
												<p className="font-sans text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
													{intelligence?.deducedAesthetic || "ANALYZING..."}
												</p>
											</div>
										</div>
									</div>

									{/* Semantic Attribute Cloud */}
									<div className="p-6 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black rounded-sm flex flex-col">
										<span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-6">
											DEDUCED_SEMANTIC_ATTRIBUTES
										</span>

										<div className="flex-1 flex flex-wrap gap-2 content-start">
											{intelligence?.deducedAttributes &&
											intelligence.deducedAttributes.length > 0 ? (
												intelligence.deducedAttributes.map(
													(attr: string, i: number) => (
														<motion.div
															key={attr}
															initial={{ opacity: 0, scale: 0.9 }}
															animate={{ opacity: 1, scale: 1 }}
															transition={{ delay: i * 0.05 }}
															className="px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-sm"
														>
															<span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
																{attr}
															</span>
														</motion.div>
													),
												)
											) : (
												<div className="w-full h-full flex flex-col items-center justify-center text-center opacity-20 space-y-2 py-12">
													<SwissIcons.Dna size={24} />
													<span className="font-mono text-[9px] uppercase tracking-widest">
														Awaiting_Semantic_Extraction
													</span>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Knowledge Map Visualization (Data-Driven) */}
								<div className="mt-8 p-10 border border-neutral-100 dark:border-neutral-900 bg-neutral-50/30 dark:bg-neutral-900/10 rounded-sm overflow-hidden relative min-h-[240px] flex flex-col items-center justify-center gap-6">
									<div className="absolute inset-0 opacity-[0.03] pointer-events-none">
										<div className="grid grid-cols-12 h-full w-full">
											{Array.from({ length: 12 }).map((_, i) => (
												<div
													key={i}
													className="border-r border-neutral-900 dark:border-white"
												/>
											))}
										</div>
									</div>

									{/* The "Cortex" visualization - pulses with data points */}
									<div className="relative flex flex-col items-center gap-4 text-center">
										<div className="flex gap-1.5 items-end h-12">
											{Array.from({ length: 24 }).map((_, i) => (
												<motion.div
													key={i}
													animate={{
														height: intelligence?.totalNodes
															? [10, Math.random() * 40 + 10, 10]
															: [4, 8, 4],
														opacity: intelligence?.totalNodes
															? [0.3, 1, 0.3]
															: [0.1, 0.2, 0.1],
													}}
													transition={{
														duration: 1.5 + (i % 5) * 0.2,
														repeat: Infinity,
														ease: "easeInOut",
													}}
													className={cn(
														"w-1 rounded-full",
														intelligence?.totalNodes
															? "bg-[#FF4D00]"
															: "bg-neutral-400",
													)}
												/>
											))}
										</div>
										<div className="space-y-1">
											<span className="font-mono text-[8px] uppercase tracking-[0.4em] text-[#FF4D00] block">
												Active_Cortex_Stream
											</span>
											<div className="flex items-center gap-4 justify-center">
												<span className="font-mono text-[7px] text-neutral-400 uppercase tracking-widest">
													SYNC_RATE:{" "}
													{intelligence?.totalNodes ? "98.2%" : "0.0%"}
												</span>
												<span className="font-mono text-[7px] text-neutral-400 uppercase tracking-widest">
													LATENCY: 14ms
												</span>
											</div>
										</div>
									</div>

									{/* Live Deducted Stream (The actual "Reasoning" proof) */}
									<div className="w-full max-w-2xl bg-black/5 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5 p-3 rounded-sm overflow-hidden">
										<div className="flex gap-8 animate-marquee whitespace-nowrap">
											{(intelligence?.deducedAttributes || [])
												.concat(intelligence?.deducedAttributes || [])
												.map((attr: string, i: number) => (
													<span
														key={i}
														className="font-mono text-[8px] text-neutral-500 uppercase tracking-[0.2em]"
													>
														{attr} // DETECTED_DNA_FRAGMENT //
													</span>
												))}
											{(!intelligence?.deducedAttributes ||
												intelligence.deducedAttributes.length === 0) && (
												<span className="font-mono text-[8px] text-neutral-400 uppercase tracking-[0.2em] opacity-50">
													SYSTEM_IDLE // AWAITING_INPUT_STREAM // STANDBY_MODE
													//
												</span>
											)}
										</div>
									</div>
								</div>
							</BrandSection>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
