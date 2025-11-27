import type { PlacedImage, PlacedVideo } from "@studio233/canvas";
import React from "react";
import { cn } from "@/lib/utils";

interface MiniMapProps {
	images: PlacedImage[];
	videos: PlacedVideo[];
	viewport: {
		x: number;
		y: number;
		scale: number;
	};
	canvasSize: {
		width: number;
		height: number;
	};
}

export const MiniMap: React.FC<MiniMapProps> = ({
	images,
	videos,
	viewport,
	canvasSize,
}) => {
	// Calculate bounds of all content
	let minX = Infinity,
		minY = Infinity;
	let maxX = -Infinity,
		maxY = -Infinity;

	// images
	images.forEach((img) => {
		minX = Math.min(minX, img.x);
		minY = Math.min(minY, img.y);
		maxX = Math.max(maxX, img.x + img.width);
		maxY = Math.max(maxY, img.y + img.height);
	});

	// videos
	videos.forEach((vid) => {
		minX = Math.min(minX, vid.x);
		minY = Math.min(minY, vid.y);
		maxX = Math.max(maxX, vid.x + vid.width);
		maxY = Math.max(maxY, vid.y + vid.height);
	});

	// If there are no elements, set default bounds
	if (
		minX === Infinity ||
		minY === Infinity ||
		maxX === -Infinity ||
		maxY === -Infinity
	) {
		minX = 0;
		minY = 0;
		maxX = canvasSize.width;
		maxY = canvasSize.height;
	}

	const contentWidth = maxX - minX;
	const contentHeight = maxY - minY;
	const miniMapWidth = 144; // w-36
	const miniMapHeight = 96; // h-24

	// Calculate scale to fit content in minimap
	const scaleX = miniMapWidth / contentWidth;
	const scaleY = miniMapHeight / contentHeight;
	const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add padding

	// Center content in minimap
	const offsetX = (miniMapWidth - contentWidth * scale) / 2;
	const offsetY = (miniMapHeight - contentHeight * scale) / 2;

	return (
		<div
			className={cn(
				"absolute bottom-6 right-6 z-20 bg-[#f4f4f0] dark:bg-[#111111] rounded-sm p-1 shadow-xl",
				"border border-neutral-200 dark:border-neutral-800",
			)}
		>
			<div className="relative w-24 h-16 md:w-36 md:h-24 bg-white dark:bg-[#1a1a1a] rounded-sm overflow-hidden border border-neutral-100 dark:border-neutral-800">
				{/* Render tiny versions of images */}
				{images.map((img) => (
					<div
						key={img.id}
						className="absolute bg-neutral-400 dark:bg-neutral-600"
						style={{
							left: `${(img.x - minX) * scale + offsetX}px`,
							top: `${(img.y - minY) * scale + offsetY}px`,
							width: `${img.width * scale}px`,
							height: `${img.height * scale}px`,
						}}
					/>
				))}

				{videos.map((vid) => (
					<div
						key={vid.id}
						className="absolute bg-neutral-500 dark:bg-neutral-500"
						style={{
							left: `${(vid.x - minX) * scale + offsetX}px`,
							top: `${(vid.y - minY) * scale + offsetY}px`,
							width: `${vid.width * scale}px`,
							height: `${vid.height * scale}px`,
						}}
					/>
				))}

				{/* Viewport indicator */}
				<div
					className="absolute border border-[#3B4B59] bg-[#3B4B59]/10"
					style={{
						left: `${(-viewport.x / viewport.scale - minX) * scale + offsetX}px`,
						top: `${(-viewport.y / viewport.scale - minY) * scale + offsetY}px`,
						width: `${(canvasSize.width / viewport.scale) * scale}px`,
						height: `${(canvasSize.height / viewport.scale) * scale}px`,
					}}
				/>
			</div>
			<div className="flex items-center justify-between mt-1 px-1">
				<span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">
					Map
				</span>
				<div className="w-1 h-1 rounded-full bg-[#3B4B59]" />
			</div>
		</div>
	);
};
