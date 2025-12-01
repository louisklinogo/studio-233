import { motion } from "framer-motion";
import { Grid3x3, List, Loader2, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { UploadedAsset, ViewMode } from "@/types/studio";

interface AssetLibraryProps {
	assets: UploadedAsset[];
	onUploadMore: () => void;
	onAssetsUploaded: (newAssets: UploadedAsset[]) => void;
	onDeleteAssets?: (assetIds: string[]) => Promise<void>;
	className?: string;
}

export function AssetLibrary({
	assets,
	onUploadMore,
	onAssetsUploaded,
	onDeleteAssets,
	className,
}: AssetLibraryProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [searchQuery, setSearchQuery] = useState("");
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(
		new Set(),
	);

	// Handle file selection and upload
	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;
		if (!selectedFiles || selectedFiles.length === 0) return;

		setIsUploading(true);
		const { upload } = await import("@vercel/blob/client");
		const newAssets: UploadedAsset[] = [];

		try {
			// Upload each file
			for (const file of Array.from(selectedFiles)) {
				const blob = await upload(file.name, file, {
					access: "public",
					handleUploadUrl: "/api/upload",
				});

				if (blob.url) {
					newAssets.push({
						id: `asset-${Date.now()}-${Math.random()}`,
						blobUrl: blob.url,
						filename: file.name,
						fileType: file.type,
						fileSize: file.size,
						uploadedAt: Date.now(),
						status: "uploaded",
					});
				}
			}

			// Notify parent component
			onAssetsUploaded(newAssets);
		} catch (error) {
			console.error("Failed to upload files:", error);
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	// Filter assets based on search
	const filteredAssets = assets.filter((asset) =>
		asset.filename.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Selection handlers
	const toggleAssetSelection = (assetId: string) => {
		setSelectedAssetIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(assetId)) {
				newSet.delete(assetId);
			} else {
				newSet.add(assetId);
			}
			return newSet;
		});
	};

	const selectAll = () => {
		setSelectedAssetIds(new Set(filteredAssets.map((a) => a.id)));
	};

	// Delete handlers
	const handleDeleteAsset = async (assetId: string) => {
		const asset = assets.find((a) => a.id === assetId);
		if (!asset || !onDeleteAssets) return;

		await onDeleteAssets([assetId]);
	};

	const handleDeleteSelected = async () => {
		if (selectedAssetIds.size === 0 || !onDeleteAssets) return;

		await onDeleteAssets(Array.from(selectedAssetIds));
		setSelectedAssetIds(new Set());
	};

	const deselectAll = () => {
		setSelectedAssetIds(new Set());
	};

	return (
		<div className={cn("flex flex-col h-full", className)}>
			{/* Header */}
			<div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-[#f4f4f0] dark:bg-[#0a0a0a]">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-3">
						<span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
							Asset Library{" "}
							<span className="text-neutral-900 dark:text-white ml-2">
								[{assets.length}]
							</span>
						</span>

						{selectedAssetIds.size > 0 && (
							<div className="flex items-center gap-2">
								<span className="text-[10px] text-neutral-300">|</span>
								<span className="font-mono text-[10px] text-[#FF4D00]">
									{selectedAssetIds.size} SELECTED
								</span>
								<button
									onClick={deselectAll}
									className="font-mono text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors uppercase"
								>
									Clear
								</button>
								{onDeleteAssets && (
									<>
										<span className="text-[10px] text-neutral-300">|</span>
										<button
											onClick={handleDeleteSelected}
											className="group flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all rounded-[2px]"
										>
											<Trash2 className="w-2.5 h-2.5 text-neutral-500 group-hover:text-red-500 transition-colors" />
											<span className="font-mono text-[9px] uppercase text-neutral-500 group-hover:text-red-500 transition-colors">
												Delete
											</span>
										</button>
									</>
								)}
							</div>
						)}
					</div>

					{/* View Mode Toggle */}
					<div className="flex items-center gap-px bg-neutral-200 dark:bg-neutral-800 p-px rounded-[2px]">
						<button
							className={cn(
								"w-6 h-6 flex items-center justify-center rounded-[1px] transition-all",
								viewMode === "grid"
									? "bg-white dark:bg-black text-neutral-900 dark:text-white shadow-sm"
									: "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
							)}
							onClick={() => setViewMode("grid")}
						>
							<Grid3x3 className="w-3 h-3" />
						</button>
						<button
							className={cn(
								"w-6 h-6 flex items-center justify-center rounded-[1px] transition-all",
								viewMode === "list"
									? "bg-white dark:bg-black text-neutral-900 dark:text-white shadow-sm"
									: "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
							)}
							onClick={() => setViewMode("list")}
						>
							<List className="w-3 h-3" />
						</button>
					</div>
				</div>

				{/* Search Bar */}
				<div className="relative group">
					<Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 group-focus-within:text-[#FF4D00] transition-colors" />
					<input
						placeholder="SEARCH_ASSETS..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full h-8 pl-8 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-[2px] font-mono text-[10px] uppercase placeholder:text-neutral-400 focus:outline-none focus:border-[#FF4D00] transition-colors"
					/>
				</div>
			</div>

			{/* Asset Grid/List */}
			<div className="flex-1 overflow-y-auto p-4 bg-[#f4f4f0] dark:bg-[#0a0a0a]">
				{filteredAssets.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center p-8">
						<p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
							{searchQuery ? "No_Matches_Found" : "Library_Empty"}
						</p>
					</div>
				) : viewMode === "grid" ? (
					<div className="grid grid-cols-2 gap-3">
						{filteredAssets.map((asset) => (
							<AssetCard
								key={asset.id}
								asset={asset}
								isSelected={selectedAssetIds.has(asset.id)}
								onToggleSelect={() => toggleAssetSelection(asset.id)}
								onDelete={onDeleteAssets ? handleDeleteAsset : undefined}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col gap-px border border-neutral-200 dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-800">
						{filteredAssets.map((asset) => (
							<AssetListItem
								key={asset.id}
								asset={asset}
								isSelected={selectedAssetIds.has(asset.id)}
								onToggleSelect={() => toggleAssetSelection(asset.id)}
							/>
						))}
					</div>
				)}
			</div>

			{/* File Input (Hidden) */}
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				multiple
				accept="image/png, image/jpeg, image/webp"
				onChange={handleFileSelect}
			/>

			{/* Upload More Button */}
			<div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-[#f4f4f0] dark:bg-[#0a0a0a]">
				<button
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
					className="w-full h-9 flex items-center justify-center gap-2 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 hover:border-[#FF4D00] hover:text-[#FF4D00] transition-all rounded-[2px] font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isUploading ? (
						<>
							<Loader2 className="w-3 h-3 animate-spin" />
							<span>Uploading...</span>
						</>
					) : (
						<span>+ Upload_Assets</span>
					)}
				</button>
			</div>
		</div>
	);
}

// Asset Card for Grid View
function AssetCard({
	asset,
	isSelected,
	onToggleSelect,
	onDelete,
}: {
	asset: UploadedAsset;
	isSelected: boolean;
	onToggleSelect: () => void;
	onDelete?: (assetId: string) => void;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			onClick={onToggleSelect}
			className={cn(
				"group relative bg-white dark:bg-[#111] rounded-[2px] overflow-hidden border transition-all cursor-pointer",
				isSelected
					? "border-[#FF4D00] ring-1 ring-[#FF4D00]/20"
					: "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700",
			)}
		>
			{/* Checkbox Overlay */}
			<div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
				<div
					className={cn(
						"w-3.5 h-3.5 rounded-[1px] border flex items-center justify-center transition-all",
						isSelected
							? "bg-[#FF4D00] border-[#FF4D00] opacity-100"
							: "bg-white dark:bg-black border-neutral-300 dark:border-neutral-700",
					)}
				>
					{isSelected && (
						<div className="w-1.5 h-1.5 bg-white rounded-[0.5px]" />
					)}
				</div>
			</div>

			{/* Thumbnail */}
			<div className="aspect-square bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center relative overflow-hidden">
				<img
					src={asset.thumbnailUrl || asset.blobUrl}
					alt={asset.filename}
					className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
				/>

				{/* Status Dot */}
				<div className="absolute top-2 right-2">
					<StatusDot status={asset.status} />
				</div>

				{/* Delete Button - Braun Style */}
				{onDelete && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onDelete(asset.id);
						}}
						className="absolute bottom-2 right-2 w-6 h-6 flex items-center justify-center bg-white/90 dark:bg-black/90 border border-neutral-200 dark:border-neutral-800 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all rounded-[2px] opacity-0 group-hover:opacity-100"
					>
						<Trash2 className="w-3 h-3 text-neutral-500 hover:text-red-500 transition-colors" />
					</button>
				)}
			</div>

			{/* Info */}
			<div className="p-2 border-t border-neutral-100 dark:border-neutral-800/50">
				<p
					className="font-mono text-[9px] text-neutral-700 dark:text-neutral-300 truncate uppercase"
					title={asset.filename}
				>
					{asset.filename}
				</p>
				<p className="font-mono text-[9px] text-neutral-400 mt-0.5">
					{formatFileSize(asset.fileSize)}
				</p>
			</div>
		</motion.div>
	);
}

// Asset List Item for List View
function AssetListItem({
	asset,
	isSelected,
	onToggleSelect,
}: {
	asset: UploadedAsset;
	isSelected: boolean;
	onToggleSelect: () => void;
}) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			onClick={onToggleSelect}
			className={cn(
				"flex items-center gap-3 p-2 bg-white dark:bg-[#111] transition-colors cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900",
				isSelected && "bg-neutral-50 dark:bg-neutral-900",
			)}
		>
			{/* Checkbox */}
			<div
				className={cn(
					"w-3 h-3 rounded-[1px] border flex items-center justify-center flex-shrink-0 transition-all",
					isSelected
						? "bg-[#FF4D00] border-[#FF4D00]"
						: "border-neutral-300 dark:border-neutral-700",
				)}
			>
				{isSelected && <div className="w-1 h-1 bg-white rounded-[0.5px]" />}
			</div>

			{/* Thumbnail */}
			<div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-900 rounded-[1px] overflow-hidden flex-shrink-0">
				<img
					src={asset.thumbnailUrl || asset.blobUrl}
					alt={asset.filename}
					className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
				/>
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<p className="font-mono text-[10px] text-neutral-700 dark:text-neutral-300 truncate uppercase">
					{asset.filename}
				</p>
			</div>

			<div className="font-mono text-[10px] text-neutral-400 w-12 text-right">
				{formatFileSize(asset.fileSize)}
			</div>

			{/* Status */}
			<div className="w-6 flex justify-center">
				<StatusDot status={asset.status} />
			</div>
		</motion.div>
	);
}

// Status Dot Component
function StatusDot({ status }: { status: UploadedAsset["status"] }) {
	if (status === "uploaded" || status === "completed") {
		return (
			<div className="w-1.5 h-1.5 bg-[#FF4D00] rounded-[0.5px]" title="Ready" />
		);
	}
	if (status === "processing") {
		return <Loader2 className="w-2.5 h-2.5 text-[#FF4D00] animate-spin" />;
	}
	if (status === "failed") {
		return (
			<div className="w-1.5 h-1.5 bg-red-500 rounded-full" title="Error" />
		);
	}
	return (
		<div
			className="w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full"
			title="Pending"
		/>
	);
}

// Helper function
function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
