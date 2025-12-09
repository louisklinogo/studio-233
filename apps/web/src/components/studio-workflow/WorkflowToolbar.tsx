"use client";

import {
	ArrowLeftRight,
	Check,
	ChevronDown,
	Compass,
	Eraser,
	Play,
	Plus,
	Redo2,
	Save,
	ScanEye,
	Trash2,
	Undo2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type ToolbarProps = {
	onAdd: () => void;
	onAddTrigger: () => void;
	onUndo: () => void;
	onRedo: () => void;
	onDelete: () => void;
	onClear: () => void;
	onFit: () => void;
	onToggleMinimap: () => void;
	onSave: () => Promise<void> | void;
	onRun: () => void;
	isSaving: boolean;
	isRunning: boolean;
	hasUnsavedChanges: boolean;
	workflowName: string;
	onRename: (value: string) => void;
	showMinimap: boolean;
};

export function WorkflowToolbar({
	onAdd,
	onAddTrigger,
	onUndo,
	onRedo,
	onDelete,
	onClear,
	onFit,
	onToggleMinimap,
	onSave,
	onRun,
	isSaving,
	isRunning,
	hasUnsavedChanges,
	workflowName,
	onRename,
	showMinimap,
}: ToolbarProps) {
	const [nameDraft, setNameDraft] = useState(workflowName);
	const [editing, setEditing] = useState(false);

	useEffect(() => setNameDraft(workflowName), [workflowName]);

	const saveName = () => {
		const next = nameDraft.trim();
		if (next.length === 0 || next === workflowName) {
			setEditing(false);
			return;
		}
		onRename(next);
		setEditing(false);
	};

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			const isInput =
				target?.tagName === "INPUT" ||
				target?.tagName === "TEXTAREA" ||
				target?.getAttribute("contenteditable") === "true";
			const meta = event.metaKey || event.ctrlKey;
			if (meta && event.key.toLowerCase() === "s") {
				event.preventDefault();
				void onSave();
			}
			if (meta && event.key.toLowerCase() === "enter") {
				event.preventDefault();
				onRun();
			}
			if (!isInput && meta && event.key.toLowerCase() === "z") {
				event.preventDefault();
				if (event.shiftKey) {
					onRedo();
				} else {
					onUndo();
				}
			}
			if (!isInput && meta && event.key === "/") {
				event.preventDefault();
				onFit();
			}
		};
		window.addEventListener("keydown", handler, true);
		return () => window.removeEventListener("keydown", handler, true);
	}, [onFit, onRedo, onRun, onSave, onUndo]);

	const nameSection = useMemo(() => {
		if (editing) {
			return (
				<div className="flex items-center gap-2">
					<input
						autoFocus
						className="h-8 rounded border border-neutral-300 bg-white px-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
						value={nameDraft}
						onChange={(e) => setNameDraft(e.target.value)}
						onBlur={saveName}
						onKeyDown={(e) => {
							if (e.key === "Enter") saveName();
							if (e.key === "Escape") setEditing(false);
						}}
					/>
					<Button
						size="icon"
						variant="ghost"
						onClick={saveName}
						className="h-8 w-8"
					>
						<Check className="w-4 h-4" />
					</Button>
				</div>
			);
		}
		return (
			<button
				type="button"
				className="flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900"
				onClick={() => setEditing(true)}
			>
				<span className="truncate max-w-[200px] text-left">
					{workflowName || "Workflow"}
				</span>
				<ChevronDown className="w-4 h-4 text-neutral-500" />
			</button>
		);
	}, [editing, nameDraft, saveName, workflowName]);

	return (
		<div className="pointer-events-auto absolute left-1/2 top-4 z-20 flex -translate-x-1/2 flex-wrap items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-2 shadow dark:border-neutral-800 dark:bg-black/70">
			{hasUnsavedChanges && (
				<span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden />
			)}
			{editing ? (
				nameSection
			) : (
				<div className="flex items-center gap-2">
					{nameSection}
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setEditing(true)}
						title="Rename"
						className="h-8 w-8"
					>
						<ArrowLeftRight className="w-4 h-4" />
					</Button>
				</div>
			)}
			<div className="hidden sm:flex items-center gap-1">
				<Button
					size="icon"
					variant="ghost"
					onClick={onAddTrigger}
					title="Add trigger"
					className="h-8 w-8"
				>
					<Plus className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					onClick={onAdd}
					title="Add step"
					className="h-8 w-8"
				>
					<Plus className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					onClick={onUndo}
					title="Undo"
					className="h-8 w-8"
				>
					<Undo2 className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					onClick={onRedo}
					title="Redo"
					className="h-8 w-8"
				>
					<Redo2 className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					onClick={onDelete}
					title="Delete selection"
					className="h-8 w-8"
				>
					<Trash2 className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					onClick={onClear}
					title="Clear workflow"
					className="h-8 w-8"
				>
					<Eraser className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					onClick={onFit}
					title="Fit view"
					className="h-8 w-8"
				>
					<Compass className="w-4 h-4" />
				</Button>
				<Button
					size="icon"
					variant={showMinimap ? "secondary" : "ghost"}
					onClick={onToggleMinimap}
					title="Toggle minimap"
					className="h-8 w-8"
				>
					<ScanEye className="w-4 h-4" />
				</Button>
			</div>
			<div className="flex items-center gap-1">
				<Button
					size="icon"
					variant="ghost"
					onClick={() => void onSave()}
					title="Save (⌘/Ctrl+S)"
					disabled={isSaving}
					className="h-8 w-8"
				>
					{isSaving ? (
						<Redo2 className="w-4 h-4 animate-spin" />
					) : (
						<Save className="w-4 h-4" />
					)}
				</Button>
				<Button
					size="sm"
					variant="secondary"
					onClick={onRun}
					disabled={isRunning}
					title="Run (⌘/Ctrl+Enter)"
					className="gap-2"
				>
					{isRunning ? (
						<Redo2 className="w-4 h-4 animate-spin" />
					) : (
						<Play className="w-4 h-4" />
					)}
					<span className="hidden sm:inline">Run</span>
				</Button>
			</div>
		</div>
	);
}
