import { motion } from "framer-motion";
import {
	Home,
	LayoutTemplate,
	MessageSquare,
	Plus,
	Settings,
	Sparkles,
} from "lucide-react";
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
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				className={cn(
					"fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4",
					className,
				)}
			>
				{/* Main Dock */}
				<div className="flex flex-col items-center gap-2 p-2 rounded-2xl bg-background/80 backdrop-blur-xl border shadow-2xl ring-1 ring-white/10">
					{/* Navigation Group */}
					<ToolbarButton
						icon={<Home className="w-5 h-5" />}
						label="Home"
						onClick={() => {}} // TODO: Navigate home
					/>

					<div className="w-8 h-[1px] bg-border/50 my-1" />

					{/* View Toggles Group */}
					<ToolbarButton
						icon={<LayoutTemplate className="w-5 h-5" />}
						label={showLeftPanel ? "Hide Assets" : "Show Assets"}
						isActive={showLeftPanel}
						onClick={onToggleLeftPanel}
					/>

					<ToolbarButton
						icon={<MessageSquare className="w-5 h-5" />}
						label={showRightPanel ? "Hide Chat" : "Show Chat"}
						isActive={showRightPanel}
						onClick={onToggleRightPanel}
					/>

					<div className="w-8 h-[1px] bg-border/50 my-1" />

					{/* Actions Group */}
					<ToolbarButton
						icon={<Plus className="w-5 h-5" />}
						label="Upload Assets"
						onClick={onUploadClick}
						variant="primary"
					/>

					<ToolbarButton
						icon={<Sparkles className="w-5 h-5" />}
						label="Batch Actions"
						onClick={() => {}} // TODO: Trigger batch
					/>

					<div className="w-8 h-[1px] bg-border/50 my-1" />

					{/* Settings Group */}
					<ToolbarButton
						icon={<Settings className="w-5 h-5" />}
						label="Settings"
						onClick={() => {}} // TODO: Open settings
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
				<button
					onClick={onClick}
					className={cn(
						"relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 group",
						variant === "primary"
							? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
							: cn(
									"hover:bg-muted text-muted-foreground hover:text-foreground",
									isActive && "bg-muted text-foreground shadow-sm",
								),
					)}
				>
					{icon}
					{/* Active Indicator Dot */}
					{isActive && variant !== "primary" && (
						<motion.div
							layoutId="active-dot"
							className="absolute -right-1 w-1 h-1 rounded-full bg-primary"
						/>
					)}
				</button>
			</TooltipTrigger>
			<TooltipContent side="right" sideOffset={10} className="font-medium">
				{label}
			</TooltipContent>
		</Tooltip>
	);
}
