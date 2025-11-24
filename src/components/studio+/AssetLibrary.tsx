import { motion } from "framer-motion";
import { Grid3x3, List, Search } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { UploadedAsset, ViewMode } from "@/types/studio";

interface AssetLibraryProps {
	assets: UploadedAsset[];
	onUploadMore: () => void;
	onAssetsUploaded: (newAssets: UploadedAsset[]) => void;
	className?: string;
}

export function AssetLibrary({
	assets,
	onUploadMore,
	onAssetsUploaded,
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

	const deselectAll = () => {
		setSelectedAssetIds(new Set());
	};

	return (
		<div className={cn("flex flex-col h-full", className)}>
			{/* Header */}
			<div className="p-4 border-b bg-background/95">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<span className="text-2xl font-bold">{assets.length}</span>
							<span className="text-base text-muted-foreground">assets</span>
						</div>

						{selectedAssetIds.size > 0 && (
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">·</span>
								<span className="text-sm font-medium text-primary">
									{selectedAssetIds.size} selected
								</span>
								<button
									onClick={deselectAll}
									className="text-xs text-muted-foreground hover:text-foreground transition-colors"
								>
									Clear
								</button>
							</div>
						)}
					</div>

					{/* View Mode Toggle */}
					<div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"h-8 w-8 p-0 transition-colors",
								viewMode === "grid" &&
									"bg-background shadow-sm hover:bg-background",
							)}
							onClick={() => setViewMode("grid")}
						>
							<Grid3x3 className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"h-8 w-8 p-0 transition-colors",
								viewMode === "list" &&
									"bg-background shadow-sm hover:bg-background",
							)}
							onClick={() => setViewMode("list")}
						>
							<List className="w-4 h-4" />
						</Button>
					</div>
				</div>

				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search assets..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 h-9 bg-muted/30 border-0"
					/>
				</div>
			</div>

			{/* Asset Grid/List */}
			<div className="flex-1 overflow-y-auto p-4">
				{filteredAssets.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center p-8">
						<p className="text-muted-foreground mb-4">
							{searchQuery
								? "No assets found matching your search"
								: "No assets uploaded yet"}
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
							/>
						))}
					</div>
				) : (
					<div className="space-y-1">
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
			<div className="p-4 border-t bg-background">
				<Button
					onClick={() => fileInputRef.current?.click()}
					variant="outline"
					disabled={isUploading}
					className="w-full h-10 hover:bg-accent/50 transition-colors"
				>
					{isUploading ? (
						<>
							<span className="animate-spin mr-2">⟳</span>
							Uploading...
						</>
					) : (
						"+ Upload More Assets"
					)}
				</Button>
			</div>
		</div>
	);
}

// Asset Card for Grid View
function AssetCard({
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
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			onClick={onToggleSelect}
			className={cn(
				"group relative bg-muted/20 rounded-lg overflow-hidden border transition-all hover:shadow-md cursor-pointer",
				isSelected
					? "border-primary ring-2 ring-primary/20"
					: "border-border/50 hover:border-border",
			)}
		>
			{/* Checkbox Overlay */}
			<div className="absolute top-2 left-2 z-10">
				<div
					className={cn(
						"w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
						isSelected
							? "bg-primary border-primary"
							: "bg-background/80 border-muted-foreground/30 group-hover:border-muted-foreground/50",
					)}
				>
					{isSelected && (
						<svg
							className="w-3 h-3 text-primary-foreground"
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="3"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path d="M5 13l4 4L19 7" />
						</svg>
					)}
				</div>
			</div>

			{/* Thumbnail */}
			<div className="aspect-square bg-muted/50 flex items-center justify-center relative">
				<img
					src={asset.thumbnailUrl || asset.blobUrl}
					alt={asset.filename}
					className="w-full h-full object-cover"
				/>

				{/* Status Pill Overlay */}
				<div className="absolute top-2 right-2">
					<StatusPill status={asset.status} />
				</div>
			</div>

			{/* Info */}
			<div className="p-2">
				<p className="text-xs font-medium truncate" title={asset.filename}>
					{asset.filename}
				</p>
				<p className="text-[10px] text-muted-foreground">
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
			initial={{ opacity: 0, x: -10 }}
			animate={{ opacity: 1, x: 0 }}
			onClick={onToggleSelect}
			className={cn(
				"flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer",
				isSelected
					? "bg-primary/10 ring-1 ring-primary/30"
					: "hover:bg-muted/30",
			)}
		>
			{/* Checkbox */}
			<div
				className={cn(
					"w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
					isSelected
						? "bg-primary border-primary"
						: "bg-background border-muted-foreground/30",
				)}
			>
				{isSelected && (
					<svg
						className="w-3 h-3 text-primary-foreground"
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="3"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path d="M5 13l4 4L19 7" />
					</svg>
				)}
			</div>

			{/* Thumbnail */}
			<div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
				<img
					src={asset.thumbnailUrl || asset.blobUrl}
					alt={asset.filename}
					className="w-full h-full object-cover"
				/>
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{asset.filename}</p>
				<p className="text-xs text-muted-foreground">
					{formatFileSize(asset.fileSize)}
				</p>
			</div>

			{/* Status */}
			<StatusPill status={asset.status} />
		</motion.div>
	);
}

// Status Pill Component
function StatusPill({ status }: { status: UploadedAsset["status"] }) {
	const styles = {
		uploaded: {
			bg: "bg-emerald-50 dark:bg-emerald-950/30",
			text: "text-emerald-600 dark:text-emerald-400",
			label: "Uploaded",
		},
		processing: {
			bg: "bg-blue-50 dark:bg-blue-950/30",
			text: "text-blue-600 dark:text-blue-400",
			label: "Processing",
		},
		completed: {
			bg: "bg-emerald-50 dark:bg-emerald-950/30",
			text: "text-emerald-600 dark:text-emerald-400",
			label: "Completed",
		},
		failed: {
			bg: "bg-red-50 dark:bg-red-950/30",
			text: "text-red-600 dark:text-red-400",
			label: "Failed",
		},
	};

	const style = styles[status];

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium",
				style.bg,
				style.text,
			)}
		>
			<div className="w-1.5 h-1.5 rounded-full bg-current" />
			<span>{style.label}</span>
		</div>
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
