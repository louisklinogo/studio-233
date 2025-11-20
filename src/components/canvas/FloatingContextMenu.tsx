import {
	ChevronDown,
	ChevronUp,
	Combine,
	Copy,
	Crop,
	Download,
	FilePlus,
	Filter,
	GripHorizontal,
	Layers,
	MoveDown,
	MoveUp,
	Play,
	Scissors,
	Video,
	X,
} from "lucide-react";
import React from "react";
import { SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
	GenerationSettings,
	PlacedImage,
	PlacedVideo,
} from "@/types/canvas";
import { exportVideoAsGif } from "@/utils/gif-export";
import { checkOS } from "@/utils/os-utils";
import { ShortcutBadge } from "./ShortcutBadge";

interface FloatingContextMenuProps {
	position: { x: number; y: number } | null;
	onOpenChange: (open: boolean) => void;
	selectedIds: string[];
	images: PlacedImage[];
	videos?: PlacedVideo[];
	isGenerating: boolean;
	generationSettings: GenerationSettings;
	isolateInputValue: string;
	isIsolating: boolean;
	handleRun: () => void;
	handleGeminiEdit?: () => void;
	isGeminiEditing?: boolean;
	handleDuplicate: () => void;
	handleRemoveBackground: () => void;
	handleCombineImages: () => void;
	handleDelete: () => void;
	handleIsolate: () => void;
	handleConvertToVideo?: (imageId: string) => void;
	handleVideoToVideo?: (videoId: string) => void;
	handleExtendVideo?: (videoId: string) => void;
	handleRemoveVideoBackground?: (videoId: string) => void;
	setCroppingImageId: (id: string | null) => void;
	setIsolateInputValue: (value: string) => void;
	setIsolateTarget: (id: string | null) => void;
	sendToFront: () => void;
	sendToBack: () => void;
	bringForward: () => void;
	sendBackward: () => void;
}

export const FloatingContextMenu: React.FC<FloatingContextMenuProps> = ({
	position,
	onOpenChange,
	selectedIds,
	images,
	videos = [],
	isGenerating,
	generationSettings,
	isolateInputValue,
	isIsolating,
	handleRun,
	handleGeminiEdit,
	isGeminiEditing,
	handleDuplicate,
	handleRemoveBackground,
	handleCombineImages,
	handleDelete,
	handleIsolate,
	handleConvertToVideo,
	handleVideoToVideo,
	handleExtendVideo,
	handleRemoveVideoBackground,
	setCroppingImageId,
	setIsolateInputValue,
	setIsolateTarget,
	sendToFront,
	sendToBack,
	bringForward,
	sendBackward,
}) => {
	const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

	// Reset drag offset when the menu is opened at a new position
	React.useEffect(() => {
		if (position) {
			setDragOffset({ x: 0, y: 0 });
		}
	}, [position]);

	if (!position) return null;

	const handleDragStart = (e: React.PointerEvent) => {
		e.preventDefault();
		const startX = e.clientX;
		const startY = e.clientY;
		const startOffset = dragOffset;

		const handlePointerMove = (e: PointerEvent) => {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			setDragOffset({
				x: startOffset.x + dx,
				y: startOffset.y + dy,
			});
		};

		const handlePointerUp = () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
	};

	const currentX = position.x + dragOffset.x;
	const currentY = position.y + dragOffset.y;

	return (
		<DropdownMenu open={!!position} onOpenChange={onOpenChange} modal={false}>
			<DropdownMenuTrigger asChild>
				<div
					style={{
						position: "fixed",
						top: currentY,
						left: currentX,
						width: 1,
						height: 1,
						opacity: 0,
						pointerEvents: "none",
					}}
				/>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				side="right"
				sideOffset={0}
				className="w-56 bg-background select-none"
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<div
					className="flex items-center justify-center py-1 cursor-move hover:bg-accent/50 rounded-sm mb-1"
					onPointerDown={handleDragStart}
				>
					<GripHorizontal className="h-4 w-4 text-muted-foreground/50" />
				</div>
				<DropdownMenuItem
					onClick={handleRun}
					disabled={isGenerating || !generationSettings.prompt.trim()}
					className="flex items-center justify-between gap-2"
				>
					<div className="flex items-center gap-2">
						{isGenerating ? (
							<SpinnerIcon className="h-3.5 w-3.5 animate-spin text-content" />
						) : (
							<Play className="h-3.5 w-3.5 text-content" />
						)}
						<span>Run</span>
					</div>
					<ShortcutBadge
						variant="alpha"
						size="xs"
						shortcut={
							checkOS("Win") || checkOS("Linux") ? "ctrl+enter" : "meta+enter"
						}
					/>
				</DropdownMenuItem>
				{handleGeminiEdit && (
					<DropdownMenuItem
						onClick={handleGeminiEdit}
						disabled={
							selectedIds.length !== 1 ||
							videos?.some((v) => selectedIds.includes(v.id)) ||
							isGeminiEditing
						}
						className="flex items-center gap-2"
					>
						{isGeminiEditing ? (
							<SpinnerIcon className="h-3.5 w-3.5 animate-spin text-content" />
						) : (
							<Filter className="h-3.5 w-3.5" />
						)}
						Edit with Gemini
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					onClick={handleDuplicate}
					disabled={selectedIds.length === 0}
					className="flex items-center gap-2"
				>
					<Copy className="h-3.5 w-3.5" />
					Duplicate
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						if (selectedIds.length === 1) {
							setCroppingImageId(selectedIds[0]);
						}
					}}
					disabled={
						selectedIds.length !== 1 ||
						videos?.some((v) => selectedIds.includes(v.id))
					}
					className="flex items-center gap-2"
				>
					<Crop className="h-3.5 w-3.5" />
					Crop
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleRemoveBackground}
					disabled={
						selectedIds.length === 0 ||
						videos?.some((v) => selectedIds.includes(v.id))
					}
					className="flex items-center gap-2"
				>
					<Scissors className="h-3.5 w-3.5" />
					Remove Background
				</DropdownMenuItem>
				{selectedIds.length === 1 &&
					handleConvertToVideo &&
					images.some((img) => img.id === selectedIds[0]) && (
						<DropdownMenuItem
							onClick={() => {
								handleConvertToVideo(selectedIds[0]);
							}}
							className="flex items-center gap-2"
						>
							<Video className="h-3.5 w-3.5" />
							Image to Video
						</DropdownMenuItem>
					)}
				{selectedIds.length === 1 &&
					handleExtendVideo &&
					videos?.some((v) => v.id === selectedIds[0]) && (
						<DropdownMenuItem
							onClick={() => {
								handleExtendVideo(selectedIds[0]);
							}}
							className="flex items-center gap-2"
						>
							<FilePlus className="h-3.5 w-3.5" />
							Extend Video
						</DropdownMenuItem>
					)}
				{selectedIds.length === 1 &&
					handleRemoveVideoBackground &&
					videos?.some((v) => v.id === selectedIds[0]) && (
						<DropdownMenuItem
							onClick={() => {
								handleRemoveVideoBackground(selectedIds[0]);
							}}
							className="flex items-center gap-2"
						>
							<Scissors className="h-3.5 w-3.5" />
							Remove Video Background
						</DropdownMenuItem>
					)}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger
						disabled={
							selectedIds.length !== 1 ||
							videos?.some((v) => selectedIds.includes(v.id))
						}
						className="flex items-center gap-2"
						onMouseEnter={() => {
							// Reset input value and set target when hovering over the submenu trigger
							setIsolateInputValue("");
							if (
								selectedIds.length === 1 &&
								!videos?.some((v) => v.id === selectedIds[0])
							) {
								setIsolateTarget(selectedIds[0]);
							}
						}}
					>
						<Filter className="h-3.5 w-3.5" />
						Isolate Object
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent
						className="w-72 p-3"
						sideOffset={10}
						onPointerDownOutside={(e) => e.preventDefault()}
					>
						<div
							className="flex flex-col gap-2"
							onMouseDown={(e) => e.stopPropagation()}
						>
							<Label
								htmlFor="isolate-context-input"
								className="text-sm font-medium"
							>
								What to isolate:
							</Label>
							<div className="flex gap-2">
								<Input
									id="isolate-context-input"
									type="text"
									placeholder="e.g. car, face, person"
									value={isolateInputValue}
									onChange={(e) => setIsolateInputValue(e.target.value)}
									style={{ fontSize: "16px" }}
									onKeyDown={(e) => {
										if (
											e.key === "Enter" &&
											isolateInputValue.trim() &&
											!isIsolating
										) {
											e.preventDefault();
											e.stopPropagation();
											handleIsolate();
										}
									}}
									onFocus={(e) => {
										// Select all text on focus for easier replacement
										e.target.select();
									}}
									className="flex-1"
									autoFocus
									disabled={isIsolating}
								/>
								<Button
									type="button"
									variant="secondary"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										if (isolateInputValue.trim() && !isIsolating) {
											handleIsolate();
										}
									}}
									disabled={!isolateInputValue.trim() || isIsolating}
								>
									{isIsolating ? (
										<>
											<SpinnerIcon className="h-4 w-4 animate-spin mr-1 text-white" />
											<span className="text-white">Processing...</span>
										</>
									) : (
										<>
											<span className="text-white">Run</span>
											<span className="flex flex-row space-x-0.5">
												<kbd className="flex items-center justify-center text-white tracking-tighter rounded-xl border px-1 font-mono bg-white/10 border-white/10 h-6 min-w-6 text-xs">
													↵
												</kbd>
											</span>
										</>
									)}
								</Button>
							</div>
						</div>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuItem
					onClick={handleCombineImages}
					disabled={selectedIds.length < 2}
					className="flex items-center gap-2"
				>
					<Combine className="h-3.5 w-3.5" />
					Combine Images
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger
						disabled={
							selectedIds.length === 0 ||
							videos?.some((v) => selectedIds.includes(v.id))
						}
						className="flex items-center gap-2"
					>
						<Layers className="h-3.5 w-3.5" />
						Layer Order
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-64" sideOffset={10}>
						<DropdownMenuItem
							onClick={sendToFront}
							disabled={selectedIds.length === 0}
							className="flex items-center justify-between gap-2"
						>
							<div className="flex items-center gap-2">
								<MoveUp className="h-3.5 w-3.5" />
								<span>Send to Front</span>
							</div>
							<ShortcutBadge
								variant="alpha"
								size="xs"
								shortcut={
									checkOS("Win") || checkOS("Linux") ? "ctrl+]" : "meta+]"
								}
							/>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={bringForward}
							disabled={selectedIds.length === 0}
							className="flex items-center justify-between gap-2"
						>
							<div className="flex items-center gap-2">
								<ChevronUp className="h-3.5 w-3.5" />
								<span>Bring Forward</span>
							</div>
							<ShortcutBadge variant="alpha" size="xs" shortcut="]" />
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={sendBackward}
							disabled={selectedIds.length === 0}
							className="flex items-center justify-between gap-2"
						>
							<div className="flex items-center gap-2">
								<ChevronDown className="h-3.5 w-3.5" />
								<span>Send Backward</span>
							</div>
							<ShortcutBadge variant="alpha" size="xs" shortcut="[" />
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={sendToBack}
							disabled={selectedIds.length === 0}
							className="flex items-center justify-between gap-2"
						>
							<div className="flex items-center gap-2">
								<MoveDown className="h-3.5 w-3.5" />
								<span>Send to Back</span>
							</div>
							<ShortcutBadge
								variant="alpha"
								size="xs"
								shortcut={
									checkOS("Win") || checkOS("Linux") ? "ctrl+[" : "meta+["
								}
							/>
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				{selectedIds.length === 1 &&
					videos?.some((v) => v.id === selectedIds[0]) && (
						<DropdownMenuItem
							onClick={async () => {
								const video = videos.find((v) => v.id === selectedIds[0]);
								if (video) {
									try {
										await exportVideoAsGif(video.src);
									} catch (error) {
										console.error("Failed to export GIF:", error);
									}
								}
							}}
							className="flex items-center gap-2"
						>
							<Video className="h-3.5 w-3.5" />
							Export GIF
						</DropdownMenuItem>
					)}
				<DropdownMenuItem
					onClick={async () => {
						for (const id of selectedIds) {
							const image = images.find((img) => img.id === id);
							const video = videos?.find((vid) => vid.id === id);

							if (image) {
								const link = document.createElement("a");
								link.download = `image-${Date.now()}.png`;
								link.href = image.src;
								link.click();
							} else if (video) {
								try {
									// For videos, we need to fetch as blob to force download
									const response = await fetch(video.src);
									const blob = await response.blob();
									const blobUrl = URL.createObjectURL(blob);

									const link = document.createElement("a");
									link.download = `video-${Date.now()}.mp4`;
									link.href = blobUrl;
									link.click();

									// Clean up the blob URL after a short delay
									setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
								} catch (error) {
									console.error("Failed to download video:", error);
									// Fallback to regular download if fetch fails
									const link = document.createElement("a");
									link.download = `video-${Date.now()}.mp4`;
									link.href = video.src;
									link.target = "_blank";
									link.click();
								}
							}
						}
					}}
					disabled={selectedIds.length === 0}
					className="flex items-center gap-2"
				>
					<Download className="h-3.5 w-3.5" />
					Download
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleDelete}
					disabled={selectedIds.length === 0}
					className="flex items-center gap-2 text-destructive"
				>
					<X className="h-3.5 w-3.5" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
