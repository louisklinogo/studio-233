"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { BrandAssetUpload } from "@/components/studio/brand/BrandAssetUpload";
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

type BrandSector = "VISUAL" | "PALETTE" | "ARCHIVE";

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

	// Local state for instant preview feedback
	const [localFont, setLocalFont] = useState<string>("Cabinet Grotesk");
	const [localPrimary, setLocalPrimary] = useState<string>("#FF4D00");
	const [localAccent, setLocalAccent] = useState<string>("#00FF00");

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

	const updateWorkspace = useMutation(
		trpc.workspace.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(
					trpc.workspace.getById.queryFilter({ id: workspaceId }),
				);
				setStatusMessage("BRAND_DNA_SYNCHRONIZED");
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
		{ id: "PALETTE", label: "02_CORE_PALETTE", icon: SwissIcons.Contrast },
		{ id: "ARCHIVE", label: "03_ASSET_ARCHIVE", icon: SwissIcons.Box },
	] as const;

	return (
		<div className="h-[calc(100vh-160px)] flex flex-col space-y-8">
			{/* Header - Fixed to 3xl/Bold standard */}
			<header className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6 shrink-0">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-[#FF4D00]" />
						<span className="font-mono text-xs tracking-[0.3em] text-[#FF4D00]">
							SYSTEM_BRAND_DNA
						</span>
					</div>
					<h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
						Configure Brand Archive
					</h1>
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
									{!hasLogo && !isAssetsLoading && (
										<div className="p-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm flex flex-col items-center justify-center text-center space-y-4 bg-neutral-50/30 dark:bg-white/5">
											<div className="w-16 h-16 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center bg-white dark:bg-black shadow-inner">
												<SwissIcons.Box
													size={24}
													className="text-[#FF4D00] animate-pulse"
												/>
											</div>
											<div className="max-w-md space-y-2">
												<h3 className="font-mono text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-widest">
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
										{brandAssets?.map((asset: any, idx: number) => (
											<motion.div
												key={asset.id}
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: idx * 0.05 }}
												className="group relative aspect-square bg-white dark:bg-[#050505] flex flex-col p-4 transition-all hover:z-10 hover:shadow-2xl"
											>
												<div className="flex-1 flex items-center justify-center overflow-hidden mb-4 p-2">
													<img
														src={asset.url}
														alt={asset.name}
														className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 scale-90 group-hover:scale-100"
													/>
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
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
