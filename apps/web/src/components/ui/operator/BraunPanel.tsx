"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BraunPanelProps extends React.HTMLAttributes<HTMLDivElement> {
	title?: string;
	description?: string;
}

export const BraunPanel = React.forwardRef<HTMLDivElement, BraunPanelProps>(
	({ className, title, description, children, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"relative flex flex-col gap-4",
					// Material
					"bg-[#f4f4f0] dark:bg-[#0a0a0a]",
					"border border-neutral-200 dark:border-neutral-800",
					"p-6",
					className,
				)}
				{...props}
			>
				{/* Screw Head Top-Left */}
				<div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center opacity-50">
					<div className="w-full h-[1px] bg-neutral-300 dark:bg-neutral-700 rotate-45" />
				</div>
				{/* Screw Head Top-Right */}
				<div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center opacity-50">
					<div className="w-full h-[1px] bg-neutral-300 dark:bg-neutral-700 -rotate-45" />
				</div>
				{/* Screw Head Bottom-Left */}
				<div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center opacity-50">
					<div className="w-full h-[1px] bg-neutral-300 dark:bg-neutral-700 -rotate-12" />
				</div>
				{/* Screw Head Bottom-Right */}
				<div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center opacity-50">
					<div className="w-full h-[1px] bg-neutral-300 dark:bg-neutral-700 rotate-12" />
				</div>

				{(title || description) && (
					<div className="space-y-1 mb-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
						{title && (
							<h3 className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-neutral-900 dark:text-white">
								{title}
							</h3>
						)}
						{description && (
							<p className="font-sans text-xs text-neutral-500">
								{description}
							</p>
						)}
					</div>
				)}

				<div className="relative z-10">{children}</div>
			</div>
		);
	},
);
BraunPanel.displayName = "BraunPanel";
