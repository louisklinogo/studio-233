"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { BrandAssetUpload } from "./BrandAssetUpload";

interface BrandPanelProps {
	isOpen: boolean;
	onClose: () => void;
	workspaceId: string;
	className?: string;
}

export function BrandPanel({
	isOpen,
	onClose,
	workspaceId,
	className,
}: BrandPanelProps) {
	const trpc = useTRPC();
	const { data: workspace, isLoading: isWorkspaceLoading } = useQuery(
		trpc.workspace.getById.queryOptions({
			id: workspaceId,
		}),
	);

	const { data: brandAssets, isLoading: isAssetsLoading } = useQuery(
		trpc.workspace.getBrandAssets.queryOptions({
			workspaceId,
		}),
	);

	const brandProfile = workspace?.brandProfile as any;
	const primaryColor = brandProfile?.primaryColor || "#FF4D00";
	const accentColor = brandProfile?.accentColor || "#00FF00";
	const fontFamily = brandProfile?.fontFamily || "Inter";

	const handleDragStart = (e: React.DragEvent, asset: any) => {
		e.dataTransfer.setData("application/studio-asset", JSON.stringify(asset));
		e.dataTransfer.setData("text/plain", asset.url);
		e.dataTransfer.effectAllowed = "copy";
	};

	return (
		<motion.div
			initial={{ x: "-100%" }}
			animate={{ x: isOpen ? 0 : "-100%" }}
			transition={{ type: "spring", damping: 30, stiffness: 300 }}
			className={cn(
				"fixed left-0 top-0 bottom-0 w-[320px] bg-[#f4f4f0] dark:bg-[#0a0a0a] border-r border-neutral-200 dark:border-neutral-800 z-40 flex flex-col shadow-2xl",
				className,
			)}
		>
			{/* Header - Industrial Plate */}
			<div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
				<div className="flex flex-col">
					<span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#FF4D00]">
						Identity_Arch
					</span>
					<h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
						Brand Archive
					</h2>
				</div>
				<button
					onClick={onClose}
					className="w-8 h-8 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors rounded-sm"
				>
					<SwissIcons.Close size={16} className="text-neutral-500" />
				</button>
			</div>

			{/* Core Content */}
			<div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-swiss">
				{/* Palette Section */}
				<section className="space-y-4">
					<div className="flex items-center gap-2">
						<div className="w-1 h-3 bg-[#FF4D00]" />
						<span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
							Master Palette
						</span>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<ColorChip label="PRIMARY" color={primaryColor} />
						<ColorChip label="ACCENT" color={accentColor} />
					</div>
				</section>

				{/* Asset Archive */}
				<section className="space-y-4">
					<div className="flex items-center gap-2">
						<div className="w-1 h-3 bg-[#FF4D00]" />
						<span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
							Logos & Marks
						</span>
					</div>

					{isAssetsLoading ? (
						<div className="grid grid-cols-2 gap-2">
							{[1, 2].map((i) => (
								<div
									key={i}
									className="aspect-square bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded-sm"
								/>
							))}
						</div>
					) : brandAssets && brandAssets.length > 0 ? (
						<div className="grid grid-cols-2 gap-2">
							{brandAssets.map((asset: any) => (
								<div
									key={asset.id}
									draggable
									onDragStart={(e) => handleDragStart(e, asset)}
									className="aspect-square bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-sm flex items-center justify-center group cursor-grab active:cursor-grabbing hover:border-[#FF4D00] transition-all relative overflow-hidden"
								>
									<img
										src={asset.url}
										alt={asset.name}
										className="max-w-[80%] max-h-[80%] object-contain grayscale group-hover:grayscale-0 transition-all"
									/>
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
									<span className="absolute bottom-1 left-1 font-mono text-[8px] text-neutral-400 opacity-0 group-hover:opacity-100 uppercase truncate max-w-[90%]">
										{asset.name.replace(/\.[^/.]+$/, "")}
									</span>
								</div>
							))}
						</div>
					) : (
						<div className="p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm flex flex-col items-center justify-center text-center space-y-2">
							<SwissIcons.Box size={24} className="text-neutral-300" />
							<p className="font-mono text-[9px] text-neutral-400 uppercase">
								No_Brand_Assets
							</p>
						</div>
					)}

					<BrandAssetUpload workspaceId={workspaceId} />
				</section>

				{/* Typeface Section */}
				<section className="space-y-4">
					<div className="flex items-center gap-2">
						<div className="w-1 h-3 bg-[#FF4D00]" />
						<span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
							Typography
						</span>
					</div>
					<div className="p-4 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-sm">
						<p className="font-mono text-[10px] text-neutral-400 mb-2">
							SYSTEM_FONT
						</p>
						<h3
							className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white"
							style={{ fontFamily }}
						>
							{fontFamily.toUpperCase()}
						</h3>
						<p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">
							Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv
							Ww Xx Yy Zz
						</p>
					</div>
				</section>
			</div>

			{/* Footer - System Info */}
			<div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-[#f4f4f0] dark:bg-[#0a0a0a]">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
						<span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
							Refinery_Linked
						</span>
					</div>
					<span className="font-mono text-[8px] text-neutral-400 tabular-nums">
						v1.0.4-ARCH
					</span>
				</div>
			</div>
		</motion.div>
	);
}

function ColorChip({ label, color }: { label: string; color: string }) {
	const copyToClipboard = () => {
		navigator.clipboard.writeText(color);
		// In a real app we'd show a toast
	};

	return (
		<div className="space-y-2">
			<div
				onClick={copyToClipboard}
				className="h-20 rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] relative group cursor-pointer"
				style={{ backgroundColor: color }}
			>
				<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
					<SwissIcons.Copy size={14} className="text-white" />
				</div>
			</div>
			<div className="flex flex-col">
				<span className="font-mono text-[8px] text-neutral-500 uppercase tracking-tighter">
					{label}
				</span>
				<span className="font-mono text-xs font-bold text-neutral-900 dark:text-white tabular-nums">
					{color.toUpperCase()}
				</span>
			</div>
		</div>
	);
}
