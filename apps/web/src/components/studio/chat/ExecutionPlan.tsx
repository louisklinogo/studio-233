import type { ToolUIPart } from "ai";
import React from "react";
import {
	Confirmation,
	ConfirmationAction,
	ConfirmationActions,
	ConfirmationRequest,
} from "@/components/ai-elements/confirmation";
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
	approval?: ToolUIPart["approval"];
	state?: ToolUIPart["state"];
	onConfirm?: (approved: boolean) => void;
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
	approval,
	state,
	onConfirm,
	onRevise,
}) => {
	return (
		<Plan isStreaming={isStreaming} defaultOpen={true} className="my-4">
			<PlanHeader>
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<span
							className={cn(
								"font-mono text-[8px] px-1.5 py-0.5 rounded-[1px] border tracking-wider",
								requiresApproval || (approval && state === "approval-requested")
									? "text-[#FF4D00] border-[#FF4D00]/30 bg-[#FF4D00]/5"
									: "text-neutral-400 border-neutral-200 dark:border-neutral-800",
							)}
						>
							{approval && state === "approval-requested"
								? "AWAITING_APPROVAL"
								: requiresApproval
									? "ACTION_REQUIRED"
									: "SYSTEM_PROCESS"}
						</span>
						<PlanTitle className="font-sans text-[11px] font-bold text-neutral-900 dark:text-white tracking-tight normal-case">
							{task}
						</PlanTitle>
					</div>
					{description && (
						<PlanDescription className="mt-0.5">{description}</PlanDescription>
					)}
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

			{approval && (
				<Confirmation
					approval={approval}
					state={state || "input-streaming"}
					className="border-none bg-transparent p-0"
				>
					<ConfirmationRequest>
						<PlanFooter className="flex items-center gap-2 justify-end mt-4">
							<ConfirmationAction
								variant="outline"
								onClick={onRevise}
								className="px-3 py-1.5 rounded-[2px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[9px] font-bold uppercase tracking-widest transition-colors border-none h-auto"
							>
								Revise_Plan
							</ConfirmationAction>
							<ConfirmationAction
								variant="default"
								onClick={() => onConfirm?.(true)}
								className="flex items-center gap-2 px-3 py-1.5 rounded-[2px] bg-[#1a1a1a] hover:bg-black text-white text-[9px] font-bold uppercase tracking-widest transition-all active:translate-y-[1px] h-auto"
							>
								<SwissIcons.Check size={10} className="text-[#FF4D00]" />
								Confirm_Plan
							</ConfirmationAction>
						</PlanFooter>
					</ConfirmationRequest>
				</Confirmation>
			)}

			{approval?.approved === true && (
				<div className="px-4 py-2 bg-green-50/50 border-t border-green-100 flex items-center gap-2">
					<SwissIcons.Check size={10} className="text-green-600" />
					<span className="text-[8px] font-mono text-green-700 uppercase tracking-widest">
						Plan_Confirmed // Proceeding
					</span>
				</div>
			)}

			{approval?.approved === false && (
				<div className="px-4 py-2 bg-red-50/50 border-t border-red-100 flex items-center gap-2">
					<SwissIcons.Close size={10} className="text-red-600" />
					<span className="text-[8px] font-mono text-red-700 uppercase tracking-widest">
						Plan_Rejected // Standing By
					</span>
				</div>
			)}
		</Plan>
	);
};
