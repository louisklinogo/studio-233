"use client";

import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConsoleFooterProps {
	canStart: boolean;
	onStartBatch: () => void;
	onBack?: () => void;
}

export function ConsoleFooter({
	canStart,
	onStartBatch,
	onBack,
}: ConsoleFooterProps) {
	return (
		<div className="border-t border-border bg-background p-0">
			{/* Simulated Console Status Line */}
			<div className="bg-muted/50 px-4 py-2 flex justify-between items-center border-b border-border">
				<div className="flex items-center gap-2">
					<div
						className={cn(
							"w-2 h-2 rounded-full",
							canStart
								? "bg-emerald-500 animate-pulse"
								: "bg-muted-foreground/50",
						)}
					/>
					<span className="text-[10px] text-muted-foreground font-mono uppercase">
						{canStart ? "SYSTEM READY" : "WAITING FOR INPUT"}
					</span>
				</div>
				<div className="text-[10px] text-muted-foreground font-mono">
					v2.3.0
				</div>
			</div>

			<div className="p-4 flex gap-3">
				{onBack && (
					<Button
						variant="ghost"
						onClick={onBack}
						className="text-muted-foreground hover:text-foreground hover:bg-muted"
					>
						<ArrowRight className="w-4 h-4 rotate-180" />
					</Button>
				)}
				<Button
					onClick={onStartBatch}
					disabled={!canStart}
					className={cn(
						"flex-1 rounded-md font-mono text-xs tracking-wide h-10 transition-all",
						canStart
							? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
							: "bg-muted text-muted-foreground border border-border",
					)}
				>
					<Play className="w-3 h-3 mr-2 fill-current" />
					EXECUTE_BATCH
				</Button>
			</div>
		</div>
	);
}
