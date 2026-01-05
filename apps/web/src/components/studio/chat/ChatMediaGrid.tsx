"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import React from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

interface ChatMediaGridProps {
	workspaceId: string;
	className?: string;
}

export const ChatMediaGrid: React.FC<ChatMediaGridProps> = ({
	workspaceId,
	className,
}) => {
	const trpc = useTRPC();

	const { data: media, isLoading } = useQuery({
		...trpc.asset.getChatMedia.queryOptions({ workspaceId }),
		refetchOnWindowFocus: false,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-12">
				<div className="w-4 h-4 rounded-full border-2 border-border border-t-[#FF4D00] animate-spin" />
			</div>
		);
	}

	if (!media || media.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-muted-foreground opacity-40">
				<SwissIcons.Image className="w-8 h-8 mb-4" />
				<div className="text-center text-[10px] uppercase tracking-[0.2em] font-mono">
					No Media Assets
				</div>
			</div>
		);
	}

	return (
		<div className={cn("grid grid-cols-2 gap-px bg-border", className)}>
			{media.map((asset) => (
				<div
					key={asset.id}
					draggable
					onDragStart={(e) => {
						const assetData = {
							id: asset.id,
							url: asset.url,
							name: asset.name,
							type: asset.type,
						};
						e.dataTransfer.setData(
							"application/studio-asset",
							JSON.stringify(assetData),
						);
						e.dataTransfer.effectAllowed = "copy";
					}}
					className="aspect-square bg-background relative group cursor-grab active:cursor-grabbing overflow-hidden"
				>
					<img
						src={asset.url}
						alt={asset.name}
						className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
					/>

					{/* Hover Spec Overlay */}
					<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 pointer-events-none">
						<div className="font-mono text-[8px] text-white uppercase truncate">
							{asset.name}
						</div>
						<div className="flex items-center gap-2 mt-1">
							<span className="text-[8px] text-[#FF4D00] font-bold">
								{asset.type}
							</span>
							{asset.metadata &&
								typeof asset.metadata === "object" &&
								(asset.metadata as any).dimensions && (
									<span className="text-[8px] text-white/60">
										{(asset.metadata as any).dimensions}
									</span>
								)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
