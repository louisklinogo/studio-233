"use client";

import { ConsoleFooter } from "./configuration/ConsoleFooter";
import { WorkflowType } from "./configuration/constants";
import { ParameterGrid } from "./configuration/ParameterGrid";
import { ScriptSelector } from "./configuration/ScriptSelector";

interface ConfigurationPanelProps {
	filesCount: number;
	workflowType: WorkflowType;
	onWorkflowChange: (workflow: WorkflowType) => void;
	referenceImage: File | null;
	onReferenceChange: (file: File | null) => void;
	customPrompt: string;
	onPromptChange: (prompt: string) => void;
	onStartBatch: () => void;
	onBack?: () => void;
}

export function ConfigurationPanel({
	filesCount,
	workflowType,
	onWorkflowChange,
	referenceImage,
	onReferenceChange,
	customPrompt,
	onPromptChange,
	onStartBatch,
	onBack,
}: ConfigurationPanelProps) {
	// Logic for "canStart" - similar to original but updated for new structure
	// Custom script doesn't necessarily need a reference image, but others might.
	// For simplicity/safety, we'll enforce at least 1 file selected.
	// The specific "needsReference" check logic can be refined if needed,
	// but the ParameterGrid handles the upload UI.
	// Here we just check if we have files.

	const needsReference = workflowType !== "custom"; // Simplified check based on previous logic
	const hasReference = referenceImage !== null;

	const canStart = filesCount > 0 && (!needsReference || hasReference);

	return (
		<div className="flex flex-col h-full bg-background text-foreground font-mono text-sm border-l border-border">
			<ScriptSelector value={workflowType} onChange={onWorkflowChange} />

			<ParameterGrid
				workflowType={workflowType}
				filesCount={filesCount}
				referenceImage={referenceImage}
				onReferenceChange={onReferenceChange}
				customPrompt={customPrompt}
				onPromptChange={onPromptChange}
			/>

			<ConsoleFooter
				canStart={canStart}
				onStartBatch={onStartBatch}
				onBack={onBack}
			/>
		</div>
	);
}
