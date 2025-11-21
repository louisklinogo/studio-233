import { ArrowRight, CheckCircle2, Circle, Loader2 } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface PipelineVisualizerProps {
	steps: {
		id: string;
		label: string;
		status: "pending" | "processing" | "completed" | "failed";
	}[];
	currentStepId?: string;
}

export function PipelineVisualizer({
	steps,
	currentStepId,
}: PipelineVisualizerProps) {
	return (
		<div className="flex items-center gap-2">
			{steps.map((step, i) => (
				<div key={step.id} className="flex items-center">
					<div
						className={cn(
							"flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
							step.status === "completed"
								? "bg-green-500/10 text-green-600 border-green-200"
								: step.status === "processing"
									? "bg-blue-500/10 text-blue-600 border-blue-200 animate-pulse"
									: step.status === "failed"
										? "bg-red-500/10 text-red-600 border-red-200"
										: "bg-muted text-muted-foreground border-transparent",
						)}
					>
						{step.status === "completed" && (
							<CheckCircle2 className="w-3 h-3" />
						)}
						{step.status === "processing" && (
							<Loader2 className="w-3 h-3 animate-spin" />
						)}
						{step.status === "pending" && <Circle className="w-3 h-3" />}
						{step.status === "failed" && (
							<Circle className="w-3 h-3 text-red-500" />
						)}
						{step.label}
					</div>
					{i < steps.length - 1 && (
						<div className="w-4 h-[1px] bg-muted-foreground/20 mx-1" />
					)}
				</div>
			))}
		</div>
	);
}
