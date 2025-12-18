"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { InputQueue } from "@/components/studio+/InputQueue";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { ConfigPanel } from "./inspector/ConfigPanel";
import { DetectionPanel } from "./inspector/DetectionPanel";
import { GatePanel } from "./inspector/GatePanel";
import { GenerationPanel } from "./inspector/GenerationPanel";
import { RouterPanel } from "./inspector/RouterPanel";
import { SourcePanel } from "./inspector/SourcePanel";
import { VisionPanel } from "./inspector/VisionPanel";

interface NodeInspectorProps {
	nodeId?: string;
	nodeType?: string;
	nodeLabel?: string;
	nodeCategory?: string;
	onClose: () => void;
	onToggleOutput: () => void;
	onDelete: () => void;
	isOutputVisible: boolean;
	hasOutputData: boolean;
	triggerFiles?: File[];
	isTriggerUploading?: boolean;
	triggerUploadProgress?: number;
	onTriggerFilesSelected?: (files: File[]) => void;
	onTriggerRemoveFile?: (index: number) => void;
	onTriggerUpload?: () => void;
}

export function NodeInspector({
	nodeId,
	nodeType,
	nodeLabel,
	nodeCategory,
	onClose,
	onToggleOutput,
	onDelete,
	isOutputVisible,
	hasOutputData,
	triggerFiles,
	isTriggerUploading,
	triggerUploadProgress,
	onTriggerFilesSelected,
	onTriggerRemoveFile,
	onTriggerUpload,
}: NodeInspectorProps) {
	const [activeTab, setActiveTab] = useState<"config" | "source">("source");
	const [localFiles, setLocalFiles] = useState<File[]>([]);
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

	const effectiveFiles = triggerFiles ?? localFiles;
	const handleFilesSelected = onTriggerFilesSelected
		? onTriggerFilesSelected
		: (files: File[]) => setLocalFiles((prev) => [...prev, ...files]);
	const handleRemoveFile = onTriggerRemoveFile
		? onTriggerRemoveFile
		: (index: number) =>
				setLocalFiles((prev) => prev.filter((_, idx) => idx !== index));
	const handleUpload = onTriggerUpload
		? onTriggerUpload
		: () => {
				// no-op: wiring happens in StudioOperatorClient
			};

	// Determine Inspector Width based on Content
	// Fixed width of 480px as per user requirement for "Rich InputQueue" support
	const inspectorWidth = "w-[480px]";

	if (!nodeId) {
		return (
			<div className="h-full w-[320px] bg-[#f4f4f0] dark:bg-[#111] border-l border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-neutral-400 p-8 text-center">
				<div className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center mb-4">
					<SwissIcons.Cursor size={20} className="opacity-50" />
				</div>
				<p className="text-xs font-mono uppercase tracking-wide">
					Select a module to configure
				</p>
			</div>
		);
	}

	// Determine which Config Panel to render
	const renderConfigPanel = () => {
		// Trigger nodes handle their own tabs (Source vs Config), but if we are in Config tab:
		// Currently SourcePanel is just for queue. We might want generic config for triggers?
		// For now, let's keep the existing logic where Trigger shows InputQueue on 'source' tab.

		if (nodeType === "trigger") {
			// Trigger config (non-source) could be generic or specific (e.g. Cron settings)
			// For this iteration, let's return a simple generic panel or detection panel if applicable?
			// Actually, `accessory_detector` is likely a 'process' node, not a trigger.
			// Let's stick to the plan:
			return <ConfigPanel type={nodeType} />; // Keep generic for trigger config for now
		}

		if (nodeType === "gate") return <GatePanel />;
		if (nodeType === "router") return <RouterPanel />;

		// Standard Nodes based on Category
		if (nodeCategory === "vision") return <VisionPanel />;
		if (nodeCategory === "generation") return <GenerationPanel />;
		if (nodeCategory === "detection") return <DetectionPanel />;

		// Fallback
		return <ConfigPanel type={nodeType} />;
	};

	return (
		<div
			className={`${inspectorWidth} h-full bg-[#f4f4f0] dark:bg-[#111] border-l border-neutral-200 dark:border-neutral-800 flex flex-col z-20 shadow-xl transition-all duration-300`}
		>
			{/* Header */}
			<div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a]">
				<div className="flex items-center gap-3">
					<div className="w-2 h-2 rounded-full bg-[#FF4D00] shadow-[0_0_6px_#FF4D00]" />
					<div className="flex flex-col">
						<span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
							Inspector // {nodeType?.toUpperCase()}
						</span>
						<span className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[180px]">
							{nodeLabel}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{/* Monitor Toggle */}
					<button
						onClick={onToggleOutput}
						disabled={!hasOutputData}
						className={cn(
							"h-8 px-3 flex items-center gap-2 rounded-[2px] transition-all border",
							isOutputVisible
								? "bg-[#FF4D00] text-white border-[#FF4D00]"
								: hasOutputData
									? "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-transparent hover:bg-neutral-200"
									: "bg-transparent text-neutral-300 dark:text-neutral-700 border-transparent cursor-not-allowed",
						)}
						title={
							hasOutputData
								? "Toggle Output Monitor"
								: "No Output Data Available"
						}
					>
						<SwissIcons.Film size={12} />
						<span className="text-[10px] font-mono font-bold uppercase hidden sm:inline">
							{isOutputVisible ? "MONITOR ON" : "MONITOR"}
						</span>
					</button>

					<button
						onClick={onClose}
						className="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-[2px] transition-colors"
					>
						<SwissIcons.Close size={14} />
					</button>
				</div>
			</div>

			{/* Tabs (Only for Source/Trigger Nodes) */}
			{nodeType === "trigger" && (
				<div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#151515]">
					<TabButton
						active={activeTab === "source"}
						onClick={() => setActiveTab("source")}
						label="Input Source"
					/>
					<TabButton
						active={activeTab === "config"}
						onClick={() => setActiveTab("config")}
						label="Configuration"
					/>
				</div>
			)}

			{/* Content Scroll Area */}
			<div className="flex-1 overflow-hidden relative">
				{nodeType === "trigger" && activeTab === "source" ? (
					<div className="absolute inset-0 bg-white dark:bg-[#0a0a0a]">
						<InputQueue
							files={effectiveFiles}
							onFilesSelected={handleFilesSelected}
							onRemoveFile={handleRemoveFile}
							onUpload={handleUpload}
							isUploading={isTriggerUploading ?? false}
							uploadProgress={triggerUploadProgress ?? 0}
						/>
					</div>
				) : (
					<div className="p-4 space-y-6 overflow-y-auto h-full">
						{renderConfigPanel()}
					</div>
				)}
			</div>

			{/* Footer Status */}
			<div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#151515] flex justify-between items-center">
				<div className="flex items-center gap-3 text-[9px] font-mono uppercase text-neutral-500">
					<span>ID: {nodeId.split("-")[0]}...</span>
					<span className="flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-[#00C040]" />
						Active
					</span>
				</div>

				{/* Delete Action */}
				<div className="flex items-center">
					{isConfirmingDelete ? (
						<div className="flex items-center gap-2">
							<span className="text-[9px] font-bold text-red-500 uppercase">
								Sure?
							</span>
							<button
								onClick={onDelete}
								className="text-[9px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-[2px] uppercase"
							>
								Yes
							</button>
							<button
								onClick={() => setIsConfirmingDelete(false)}
								className="text-[9px] font-bold text-neutral-500 hover:text-neutral-700 px-2 py-1 uppercase"
							>
								No
							</button>
						</div>
					) : (
						<button
							onClick={() => setIsConfirmingDelete(true)}
							className="flex items-center gap-1 text-[9px] font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase"
						>
							<SwissIcons.Trash size={10} />
							<span>Delete Module</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

function TabButton({
	active,
	onClick,
	label,
}: {
	active: boolean;
	onClick: () => void;
	label: string;
}) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"flex-1 h-10 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors border-b-2",
				active
					? "border-[#FF4D00] text-[#FF4D00] bg-[#FF4D00]/5"
					: "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
			)}
		>
			{label}
		</button>
	);
}
