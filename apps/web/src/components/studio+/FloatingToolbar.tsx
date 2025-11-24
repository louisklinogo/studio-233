
import { motion } from "framer-motion";
import {
	House,
	SquaresFour,
	ChatCircle,
	Plus,
	Gear,
	Lightning,
	Command,
} from "@phosphor-icons/react";
import React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
	showLeftPanel: boolean;
	showRightPanel: boolean;
	onToggleLeftPanel: () => void;
	onToggleRightPanel: () => void;
	onUploadClick: () => void;
	className?: string;
}

export function FloatingToolbar({
	showLeftPanel,
	showRightPanel,
	onToggleLeftPanel,
	onToggleRightPanel,
	onUploadClick,
	className,
}: FloatingToolbarProps) {
	return (
		<TooltipProvider delayDuration={0}>
			<motion.div
				initial={{ opacity: 0, y: 20, x: "-50%" }}
				animate={{ opacity: 1, y: 0, x: "-50%" }}
				className={cn(
					"absolute bottom-6 left-1/2 z-50 flex items-end gap-2",
					className,
				)}
			>
				{/* Main Dock */}
				<div className="flex items-center gap-1.5 p-2 rounded-2xl bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
					{/* Navigation Group */}
					<ToolbarButton
						icon={<House weight="duotone" className="w-5 h-5" />}
						label="Home"
						onClick={() => { }} // TODO: Navigate home
					/>

					<div className="w-[1px] h-6 bg-border/20 mx-1" />

					{/* View Toggles Group */}
					<ToolbarButton
						icon={<SquaresFour weight={showLeftPanel ? "fill" : "duotone"} className="w-5 h-5" />}
						label={showLeftPanel ? "Hide Assets" : "Show Assets"}
						isActive={showLeftPanel}
						onClick={onToggleLeftPanel}
					/>

					<ToolbarButton
						icon={<ChatCircle weight={showRightPanel ? "fill" : "duotone"} className="w-5 h-5" />}
						label={showRightPanel ? "Hide Chat" : "Show Chat"}
						isActive={showRightPanel}
						onClick={onToggleRightPanel}
					/>

					<div className="w-[1px] h-6 bg-border/20 mx-1" />

					{/* Actions Group */}
					<ToolbarButton
						icon={<Plus weight="bold" className="w-5 h-5" />}
						label="Upload Assets"
						onClick={onUploadClick}
						variant="primary"
					/>

					<ToolbarButton
						icon={<Command weight="duotone" className="w-5 h-5" />}
						label="Batch Actions"
						onClick={() => { }} // TODO: Trigger batch
					/>

					<div className="w-[1px] h-6 bg-border/20 mx-1" />

					{/* Settings Group */}
					<ToolbarButton
						icon={<Gear weight="duotone" className="w-5 h-5" />}
						label="Settings"
						onClick={() => { }} // TODO: Open settings
					/>
				</div>
			</motion.div>
		</TooltipProvider>
	);
}

interface ToolbarButtonProps {
	icon: React.ReactNode;
	label: string;
	isActive?: boolean;
	onClick: () => void;
	variant?: "default" | "primary";
}

function ToolbarButton({
	icon,
	label,
	isActive,
	onClick,
	variant = "default",
}: ToolbarButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.button
					whileHover={{ scale: 1.05, y: -2 }}
					whileTap={{ scale: 0.95 }}
					onClick={onClick}
					className={cn(
						"relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group",
						variant === "primary"
							? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-xl"
							: cn(
								"hover:bg-muted/50 text-muted-foreground hover:text-foreground",
								isActive && "bg-muted/80 text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/5",
							),
					)}
				>
					{icon}
					{/* Active Indicator Dot */}
					{isActive && variant !== "primary" && (
						<motion.div
							layoutId="active-dot"
							className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
						/>
					)}
				</motion.button>
			</TooltipTrigger>
			<TooltipContent side="top" sideOffset={16} className="font-medium bg-background/80 backdrop-blur-xl border-white/10">
				{label}
			</TooltipContent>
		</Tooltip>
	);
}
