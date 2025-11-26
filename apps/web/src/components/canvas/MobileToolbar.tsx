import type { GenerationSettings, PlacedImage } from "@studio233/canvas";
import React from "react";
import { SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface MobileToolbarProps {
	selectedIds: string[];
	images: PlacedImage[];
	isGenerating: boolean;
	generationSettings: GenerationSettings;
	handleRun: () => void;
	handleDuplicate: () => void;
	handleRemoveBackground: () => void;
	handleCombineImages: () => void;
	handleDelete: () => void;
	setCroppingImageId: (id: string | null) => void;
	sendToFront: () => void;
	sendToBack: () => void;
	bringForward: () => void;
	sendBackward: () => void;
}

export const MobileToolbar: React.FC<MobileToolbarProps> = ({
	selectedIds,
	images,
	isGenerating,
	generationSettings,
	handleRun,
	handleDuplicate,
	handleRemoveBackground,
	handleCombineImages,
	handleDelete,
	setCroppingImageId,
	sendToFront,
	sendToBack,
	bringForward,
	sendBackward,
}) => {
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

	const handleAction = (action: () => void) => {
		playClickSound();
		action();
	};

	return (
		<div
			className={cn(
				"flex items-center gap-[1px] bg-neutral-200 dark:bg-neutral-800 rounded-sm overflow-hidden shadow-xl",
				"transition-all duration-300 ease-in-out",
				selectedIds.length > 0
					? "translate-y-0 opacity-100"
					: "translate-y-8 opacity-0 pointer-events-none",
			)}
		>
			{/* Chassis Background */}
			<div className="absolute inset-0 bg-[#f4f4f0] dark:bg-[#111111] -z-10" />

			{/* Run / Generate */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => handleAction(handleRun)}
				disabled={isGenerating || !generationSettings.prompt.trim()}
				className="w-10 h-10 p-0 rounded-none bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] text-neutral-500 hover:text-[#FF4D00] transition-colors"
				title="Run"
			>
				{isGenerating ? (
					<SpinnerIcon className="h-4 w-4 animate-spin" />
				) : (
					<SwissIcons.Play className="h-4 w-4" />
				)}
			</Button>

			<div className="w-[1px] h-6 bg-neutral-300 dark:bg-neutral-700" />

			{/* Duplicate */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => handleAction(handleDuplicate)}
				disabled={selectedIds.length === 0}
				className="w-10 h-10 p-0 rounded-none bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
				title="Duplicate"
			>
				<SwissIcons.Copy className="h-4 w-4" />
			</Button>

			{/* Crop */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => {
					if (selectedIds.length === 1) {
						handleAction(() => setCroppingImageId(selectedIds[0]));
					}
				}}
				disabled={selectedIds.length !== 1}
				className="w-10 h-10 p-0 rounded-none bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
				title="Crop"
			>
				<SwissIcons.Crop className="h-4 w-4" />
			</Button>

			{/* Remove BG */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => handleAction(handleRemoveBackground)}
				disabled={selectedIds.length === 0}
				className="w-10 h-10 p-0 rounded-none bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
				title="Remove Background"
			>
				<SwissIcons.Scissors className="h-4 w-4" />
			</Button>

			{/* Combine */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => handleAction(handleCombineImages)}
				disabled={selectedIds.length < 2}
				className="w-10 h-10 p-0 rounded-none bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
				title="Combine Images"
			>
				<SwissIcons.Combine className="h-4 w-4" />
			</Button>

			<div className="w-[1px] h-6 bg-neutral-300 dark:bg-neutral-700" />

			{/* Layer Order */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						disabled={selectedIds.length === 0}
						className="w-10 h-10 p-0 rounded-none bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
						title="Layer Order"
					>
						<SwissIcons.Layers className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					side="top"
					sideOffset={10}
					align="center"
					className="w-48 bg-[#f4f4f0] dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 rounded-sm p-1 shadow-xl"
				>
					<DropdownMenuItem asChild>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleAction(sendToFront)}
							disabled={selectedIds.length === 0}
							className="w-full h-8 justify-start gap-3 px-3 font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-[#1a1a1a] rounded-sm"
						>
							<SwissIcons.BringToFront className="h-3 w-3" />
							<span>To Front</span>
						</Button>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleAction(bringForward)}
							disabled={selectedIds.length === 0}
							className="w-full h-8 justify-start gap-3 px-3 font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-[#1a1a1a] rounded-sm"
						>
							<SwissIcons.ArrowUp className="h-3 w-3" />
							<span>Forward</span>
						</Button>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleAction(sendBackward)}
							disabled={selectedIds.length === 0}
							className="w-full h-8 justify-start gap-3 px-3 font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-[#1a1a1a] rounded-sm"
						>
							<SwissIcons.ArrowDown className="h-3 w-3" />
							<span>Backward</span>
						</Button>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleAction(sendToBack)}
							disabled={selectedIds.length === 0}
							className="w-full h-8 justify-start gap-3 px-3 font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-[#1a1a1a] rounded-sm"
						>
							<SwissIcons.SendToBack className="h-3 w-3" />
							<span>To Back</span>
						</Button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<div className="w-[1px] h-6 bg-neutral-300 dark:bg-neutral-700" />

			{/* Download */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => {
					handleAction(() => {
						selectedIds.forEach((id) => {
							const image = images.find((img) => img.id === id);
							if (image) {
								const link = document.createElement("a");
								link.download = `image-${Date.now()}.png`;
								link.href = image.src;
								link.click();
							}
						});
					});
				}}
				disabled={selectedIds.length === 0}
				className="w-10 h-10 p-0 rounded-none bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
				title="Download"
			>
				<SwissIcons.Download className="h-4 w-4" />
			</Button>

			{/* Delete */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => handleAction(handleDelete)}
				disabled={selectedIds.length === 0}
				className="w-10 h-10 p-0 rounded-none bg-[#f4f4f0] dark:bg-[#111111] hover:bg-red-50 dark:hover:bg-red-900/10 text-neutral-500 hover:text-red-500 transition-colors"
				title="Delete"
			>
				<SwissIcons.Trash className="h-4 w-4" />
			</Button>
		</div>
	);
};
