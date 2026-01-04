"use client";

import React from "react";
import {
	Plan,
	PlanContent,
	PlanDescription,
	PlanFooter,
	PlanHeader,
	PlanTitle,
	PlanTrigger,
} from "@/components/ai-elements/plan";
import type { TaskStatus } from "@/components/ai-elements/task";
import { TaskItem } from "@/components/ai-elements/task";
import { SwissIcons } from "@/components/ui/SwissIcons";

export interface ExecutionStep {
	id: string;
	label: string;
	details?: string;
	status?: TaskStatus;
	toolName?: string;
}

export interface ExecutionPlanProps {
	task: string;
	description?: string;
	steps: ExecutionStep[];
	isStreaming?: boolean;
	requiresApproval?: boolean;
	onConfirm?: () => void;
	onRevise?: () => void;
}

/**
 * ExecutionPlan coordinates the agent's roadmap with real-time execution status and user intervention.
 */
export const ExecutionPlan: React.FC<ExecutionPlanProps> = ({
	task,
	description,
	steps,
	isStreaming = false,
	requiresApproval = false,
	onConfirm,
	onRevise,
}) => {
	const [decision, setDecision] = React.useState<
		"confirmed" | "revised" | null
	>(null);

	const handleConfirm = () => {
		setDecision("confirmed");
		onConfirm?.();
	};

	return (
		<Plan isStreaming={isStreaming} defaultOpen={true} className="my-4">
			<PlanHeader>
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<span
							className={`font-mono text-[8px] px-1 py-0.5 rounded-[1px] border ${requiresApproval ? "text-[#FF4D00] border-[#FF4D00]/30" : "text-neutral-400 border-neutral-200"}`}
						>
							{requiresApproval ? "WAIT_FOR_USER" : "PROT_EXEC"}
						</span>
						<PlanTitle>{task}</PlanTitle>
					</div>
					{description && <PlanDescription>{description}</PlanDescription>}
				</div>
				<PlanTrigger />
			</PlanHeader>

			<PlanContent>
				<div className="space-y-1">
					{steps.map((step) => (
						<TaskItem
							key={step.id}
							label={step.label}
							details={step.details}
							status={step.status || "pending"}
						/>
					))}
				</div>
			</PlanContent>

			{requiresApproval && !decision && (
				<PlanFooter className="flex items-center gap-2 justify-end">
					<button
						onClick={onRevise}
						className="flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[9px] font-bold uppercase tracking-widest transition-colors"
					>
						Revise_Plan
					</button>
					<button
						onClick={handleConfirm}
						className="flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-[#1a1a1a] hover:bg-black text-white text-[9px] font-bold uppercase tracking-widest transition-all active:translate-y-[1px]"
					>
						<SwissIcons.Check size={10} className="text-[#FF4D00]" />
						Confirm_Plan
					</button>
				</PlanFooter>
			)}

			{decision === "confirmed" && (
				<div className="px-4 py-2 bg-green-50/50 border-t border-green-100 flex items-center gap-2">
					<SwissIcons.Check size={10} className="text-green-600" />
					<span className="text-[8px] font-mono text-green-700 uppercase tracking-widest">
						Plan_Confirmed // Proceeding
					</span>
				</div>
			)}
		</Plan>
	);
};
