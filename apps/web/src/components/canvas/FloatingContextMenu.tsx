import type {
	GenerationSettings,
	PlacedImage,
	PlacedVideo,
} from "@studio233/canvas";
import React from "react";
import { SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwissIcons } from "@/components/ui/SwissIcons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
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
	handleRun: () => void;
	handleGeminiEdit?: () => void;
	isGeminiEditing?: boolean;
	handleDuplicate: () => void;
	handleRemoveBackground: () => void;
	handleCombineImages: () => void;
	handleDelete: () => void;
	handleOpenIsolateDialog: () => void;
	handleConvertToVideo?: (imageId: string) => void;
	handleVideoToVideo?: (videoId: string) => void;
	handleExtendVideo?: (videoId: string) => void;
	handleRemoveVideoBackground?: (videoId: string) => void;
	setCroppingImageId: (id: string | null) => void;
	sendToFront: () => void;
	sendToBack: () => void;
	bringForward: () => void;
	sendBackward: () => void;
	isolateInputValue: string;
	setIsolateInputValue: (value: string) => void;
	setIsolateTarget: (id: string | null) => void;
}

export const FloatingContextMenu: React.FC<FloatingContextMenuProps> = ({
	position,
	onOpenChange,
	selectedIds,
	images,
	videos = [],
	isGenerating,
	generationSettings,
	handleRun,
	handleGeminiEdit,
	isGeminiEditing,
	handleDuplicate,
	handleRemoveBackground,
	handleCombineImages,
	handleDelete,
	handleOpenIsolateDialog,
	handleConvertToVideo,
	handleVideoToVideo,
	handleExtendVideo,
	handleRemoveVideoBackground,
	setCroppingImageId,
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
		<TooltipProvider>
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
					className="w-56 bg-background overflow-hidden p-0 rounded-xl shadow-xl border-border/50"
					onCloseAutoFocus={(e) => e.preventDefault()}
				>
					<div
						className="flex items-center justify-between px-2 py-1.5 cursor-move bg-muted/30 border-b select-none"
						onPointerDown={handleDragStart}
					>
						<div className="flex gap-1">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={handleDuplicate}
									>
										<SwissIcons.Copy className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Duplicate</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={bringForward}
									>
										<SwissIcons.ArrowUp className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Bring Forward</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={sendBackward}
									>
										<SwissIcons.ArrowDown className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Send Backward</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={handleDelete}
									>
										<SwissIcons.Trash className="h-3.5 w-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Delete</TooltipContent>
							</Tooltip>
						</div>
						<SwissIcons.Grip className="h-4 w-4 text-muted-foreground/30" />
					</div>

					<div className="overflow-y-auto max-h-[300px] p-1.5 space-y-1">
						<DropdownMenuGroup>
							<DropdownMenuItem
								onClick={handleRun}
								disabled={isGenerating || !generationSettings.prompt.trim()}
								className="flex items-center justify-between gap-2 font-medium"
							>
								<div className="flex items-center gap-2">
									{isGenerating ? (
										<SpinnerIcon className="h-3.5 w-3.5 animate-spin text-primary" />
									) : (
										<SwissIcons.Play className="h-3.5 w-3.5 text-primary" />
									)}
									<span>Run Generation</span>
								</div>
								<ShortcutBadge variant="alpha" size="xs" shortcut="Enter" />
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
										<SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
									) : (
										<SwissIcons.Filter className="h-3.5 w-3.5" />
									)}
									Edit with Gemini
								</DropdownMenuItem>
							)}
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuGroup>
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
								<SwissIcons.Crop className="h-3.5 w-3.5" />
								Crop Image
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleRemoveBackground}
								disabled={
									selectedIds.length === 0 ||
									videos?.some((v) => selectedIds.includes(v.id))
								}
								className="flex items-center gap-2"
							>
								<SwissIcons.Scissors className="h-3.5 w-3.5" />
								Remove Background
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleOpenIsolateDialog}
								disabled={
									selectedIds.length !== 1 ||
									videos?.some((v) => selectedIds.includes(v.id))
								}
								className="flex items-center gap-2"
							>
								<SwissIcons.Filter className="h-3.5 w-3.5" />
								Isolate Object...
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={handleCombineImages}
								disabled={selectedIds.length < 2}
								className="flex items-center gap-2"
							>
								<SwissIcons.Combine className="h-3.5 w-3.5" />
								Combine Images
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							{selectedIds.length === 1 &&
								handleConvertToVideo &&
								images.some((img) => img.id === selectedIds[0]) && (
									<DropdownMenuItem
										onClick={() => {
											handleConvertToVideo(selectedIds[0]);
										}}
										className="flex items-center gap-2"
									>
										<SwissIcons.Video className="h-3.5 w-3.5" />
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
										<SwissIcons.FilePlus className="h-3.5 w-3.5" />
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
										<SwissIcons.Scissors className="h-3.5 w-3.5" />
										Remove Video BG
									</DropdownMenuItem>
								)}
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger
									disabled={
										selectedIds.length === 0 ||
										videos?.some((v) => selectedIds.includes(v.id))
									}
									className="flex items-center gap-2"
								>
									<SwissIcons.Layers className="h-3.5 w-3.5" />
									Layer Order
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-48" sideOffset={10}>
									<DropdownMenuItem
										onClick={sendToFront}
										disabled={selectedIds.length === 0}
										className="flex items-center justify-between gap-2"
									>
										<div className="flex items-center gap-2">
											<SwissIcons.BringToFront className="h-3.5 w-3.5" />
											<span>Send to Front</span>
										</div>
										<ShortcutBadge
											variant="alpha"
											size="xs"
											shortcut="Ctrl+]"
										/>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={bringForward}
										disabled={selectedIds.length === 0}
										className="flex items-center justify-between gap-2"
									>
										<div className="flex items-center gap-2">
											<SwissIcons.ArrowUp className="h-3.5 w-3.5" />
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
											<SwissIcons.ArrowDown className="h-3.5 w-3.5" />
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
											<SwissIcons.SendToBack className="h-3.5 w-3.5" />
											<span>Send to Back</span>
										</div>
										<ShortcutBadge
											variant="alpha"
											size="xs"
											shortcut="Ctrl+["
										/>
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

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
							<SwissIcons.Download className="h-3.5 w-3.5" />
							Download
						</DropdownMenuItem>
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
									<SwissIcons.Video className="h-3.5 w-3.5" />
									Export GIF
								</DropdownMenuItem>
							)}
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</TooltipProvider>
	);
};
