"use client";

import type { Node } from "@xyflow/react";
import { useAtom } from "jotai";
import { Copy, GripVertical, PanelRight, Redo2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	panelCollapsedAtom,
	panelWidthAtom,
	type WorkflowNodeData,
} from "@/lib/studio-workflow/store";
import { cn } from "@/lib/utils";

type RunListItem = {
	id: string;
	state: string;
	createdAt: string;
	finishedAt?: string | null;
};
type RunDetail = {
	id: string;
	state: string;
	createdAt?: string;
	finishedAt?: string | null;
	steps?: Array<{
		id: string;
		name: string;
		order: number;
		state: string;
		toolName?: string | null;
		finishedAt?: string | null;
		error?: unknown;
		output?: unknown;
	}>;
};

type Props = {
	selectedNode?: Node<WorkflowNodeData> | null;
	onUpdateNode: (id: string, data: Partial<WorkflowNodeData>) => void;
	onDeleteSelected: () => void;
	runs: RunListItem[];
	selectedRunId: string | null;
	onSelectRun: (id: string) => void;
	runDetail?: RunDetail | null;
	isLoadingRunDetail: boolean;
	onRefreshRuns: () => void;
};

function StateBadge({ state }: { state?: string }) {
	const tone = (state || "pending").toLowerCase();
	const palette: Record<string, string> = {
		pending:
			"bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100",
		running:
			"bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200",
		completed:
			"bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
		success:
			"bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
		failed: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200",
		error: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200",
		canceled:
			"bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
	};
	return (
		<span
			className={cn(
				"px-2 py-0.5 rounded-full text-[11px] font-medium",
				palette[tone] || palette.pending,
			)}
		>
			{tone}
		</span>
	);
}

function copyJson(value: unknown) {
	try {
		navigator.clipboard.writeText(JSON.stringify(value, null, 2));
	} catch (err) {
		console.error("copy", err);
	}
}

function PropertiesPanel({
	selectedNode,
	onUpdateNode,
	onDeleteSelected,
}: Pick<Props, "selectedNode" | "onUpdateNode" | "onDeleteSelected">) {
	if (!selectedNode) {
		return (
			<p className="text-sm text-neutral-500">
				Select a node to edit its properties.
			</p>
		);
	}

	return (
		<div className="space-y-3 text-sm">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs text-neutral-500">Node</p>
					<p className="font-semibold text-neutral-900 dark:text-neutral-100">
						{selectedNode.data?.label || "Untitled"}
					</p>
				</div>
				<Button
					size="icon"
					variant="ghost"
					onClick={onDeleteSelected}
					title="Delete"
				>
					<X className="w-4 h-4" />
				</Button>
			</div>
			<label className="space-y-1 block">
				<span className="text-xs text-neutral-500">Label</span>
				<input
					className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1 text-sm dark:border-neutral-800"
					value={selectedNode.data?.label || ""}
					onChange={(e) =>
						onUpdateNode(selectedNode.id, { label: e.target.value })
					}
				/>
			</label>
			<label className="space-y-1 block">
				<span className="text-xs text-neutral-500">Description</span>
				<textarea
					className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1 text-sm dark:border-neutral-800"
					rows={3}
					value={selectedNode.data?.description || ""}
					onChange={(e) =>
						onUpdateNode(selectedNode.id, { description: e.target.value })
					}
				/>
			</label>
			<label className="space-y-1 block">
				<span className="text-xs text-neutral-500">Status</span>
				<select
					className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1 text-sm dark:border-neutral-800"
					value={selectedNode.data?.status || "idle"}
					onChange={(e) =>
						onUpdateNode(selectedNode.id, {
							status: e.target.value as WorkflowNodeData["status"],
						})
					}
				>
					<option value="idle">Idle</option>
					<option value="running">Running</option>
					<option value="success">Success</option>
					<option value="error">Error</option>
				</select>
			</label>
		</div>
	);
}

function RunsPanel({
	runs,
	selectedRunId,
	onSelectRun,
	runDetail,
	isLoadingRunDetail,
	onRefreshRuns,
}: Pick<
	Props,
	| "runs"
	| "selectedRunId"
	| "onSelectRun"
	| "runDetail"
	| "isLoadingRunDetail"
	| "onRefreshRuns"
>) {
	return (
		<div className="flex h-full gap-3">
			<div className="w-48 flex-shrink-0 space-y-2">
				<div className="flex items-center justify-between">
					<p className="text-xs font-semibold text-neutral-600 dark:text-neutral-200">
						Runs
					</p>
					<Button
						size="icon"
						variant="ghost"
						onClick={onRefreshRuns}
						title="Refresh runs"
					>
						<Redo2 className="w-4 h-4" />
					</Button>
				</div>
				<div className="space-y-1 overflow-y-auto max-h-[420px] pr-1">
					{runs.length === 0 ? (
						<p className="text-xs text-neutral-500">No runs yet.</p>
					) : (
						runs.map((run) => (
							<button
								key={run.id}
								onClick={() => onSelectRun(run.id)}
								className={cn(
									"w-full rounded border px-2 py-2 text-left text-sm",
									run.id === selectedRunId
										? "border-neutral-800 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900"
										: "border-neutral-200 bg-white hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950",
								)}
							>
								<p className="truncate font-medium">{run.id}</p>
								<div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
									<StateBadge state={run.state} />
									<span className="font-mono">
										{new Date(run.createdAt).toLocaleTimeString()}
									</span>
								</div>
							</button>
						))
					)}
				</div>
			</div>
			<div className="flex-1 rounded border border-neutral-200 p-3 dark:border-neutral-800">
				{isLoadingRunDetail ? (
					<div className="flex items-center gap-2 text-sm text-neutral-500">
						<Redo2 className="w-4 h-4 animate-spin" />
						Loading run…
					</div>
				) : runDetail ? (
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
									{runDetail.id}
								</p>
								<p className="text-xs text-neutral-500">
									{runDetail.createdAt
										? new Date(runDetail.createdAt).toLocaleString()
										: ""}
								</p>
							</div>
							<StateBadge state={runDetail.state} />
						</div>
						<div className="space-y-2">
							{runDetail.steps?.length ? (
								runDetail.steps.map((step) => (
									<div
										key={step.id}
										className="rounded border border-neutral-200 p-2 dark:border-neutral-800"
									>
										<div className="flex items-center justify-between text-sm">
											<div>
												<p className="font-semibold text-neutral-900 dark:text-neutral-100">
													{step.name}
												</p>
												<p className="text-xs text-neutral-500">
													{step.toolName || "step"}
												</p>
											</div>
											<div className="flex items-center gap-2 text-xs text-neutral-500">
												<StateBadge state={step.state} />
												{step.finishedAt ? (
													<span className="font-mono">
														{new Date(step.finishedAt).toLocaleTimeString()}
													</span>
												) : null}
											</div>
										</div>
										{step.output ? (
											<div className="mt-2 space-y-1 text-xs text-neutral-700 dark:text-neutral-200">
												<div className="flex items-center justify-between">
													<p className="font-semibold">Output</p>
													<Button
														size="icon"
														variant="ghost"
														onClick={() => copyJson(step.output)}
													>
														<Copy className="w-3 h-3" />
													</Button>
												</div>
												<pre className="overflow-auto rounded border border-neutral-200 bg-neutral-50 p-2 font-mono text-[11px] leading-relaxed dark:border-neutral-800 dark:bg-neutral-900">
													{JSON.stringify(step.output, null, 2)}
												</pre>
											</div>
										) : null}
										{step.error ? (
											<div className="mt-2 space-y-1 text-xs text-red-600 dark:text-red-300">
												<div className="flex items-center justify-between">
													<p className="font-semibold">Error</p>
													<Button
														size="icon"
														variant="ghost"
														onClick={() => copyJson(step.error)}
													>
														<Copy className="w-3 h-3" />
													</Button>
												</div>
												<pre className="overflow-auto rounded border border-red-200 bg-red-50 p-2 font-mono text-[11px] leading-relaxed dark:border-red-800/70 dark:bg-red-900/30">
													{JSON.stringify(step.error, null, 2)}
												</pre>
											</div>
										) : null}
									</div>
								))
							) : (
								<p className="text-sm text-neutral-500">No steps recorded.</p>
							)}
						</div>
					</div>
				) : (
					<p className="text-sm text-neutral-500">
						Select a run to inspect details.
					</p>
				)}
			</div>
		</div>
	);
}

export function RightPanel({
	selectedNode,
	onUpdateNode,
	onDeleteSelected,
	runs,
	selectedRunId,
	onSelectRun,
	runDetail,
	isLoadingRunDetail,
	onRefreshRuns,
}: Props) {
	const [activeTab, setActiveTab] = useState<"properties" | "runs">(
		"properties",
	);
	const [panelWidth, setPanelWidth] = useAtom(panelWidthAtom);
	const [panelCollapsed, setPanelCollapsed] = useAtom(panelCollapsedAtom);
	const resizingRef = useRef(false);

	const startResize = (event: React.MouseEvent) => {
		resizingRef.current = true;
		const startX = event.clientX;
		const startWidth = panelWidth;
		const handleMove = (move: MouseEvent) => {
			if (!resizingRef.current) return;
			const delta = startX - move.clientX;
			const width = Math.min(
				48,
				Math.max(22, startWidth + (delta / window.innerWidth) * 100),
			);
			setPanelWidth(width);
		};
		const stop = () => {
			resizingRef.current = false;
			document.removeEventListener("mousemove", handleMove);
			document.removeEventListener("mouseup", stop);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
		document.addEventListener("mousemove", handleMove);
		document.addEventListener("mouseup", stop);
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	};

	if (panelCollapsed) {
		return (
			<button
				className="pointer-events-auto absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-l-full border border-r-0 bg-white px-2 py-1 text-sm shadow dark:bg-black"
				onClick={() => setPanelCollapsed(false)}
				type="button"
			>
				<PanelRight className="w-4 h-4" />
			</button>
		);
	}

	return (
		<div
			className="pointer-events-auto relative h-full border-l border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-900 dark:bg-neutral-950/80"
			style={{ width: `${panelWidth}%` }}
		>
			<div
				className="absolute inset-y-0 left-0 w-3 cursor-col-resize"
				onMouseDown={startResize}
				title="Resize panel"
			>
				<div className="absolute inset-y-0 left-0 w-1 bg-transparent hover:bg-neutral-300 dark:hover:bg-neutral-700" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-200 p-1 shadow dark:bg-neutral-700">
					<GripVertical className="w-3 h-3" />
				</div>
			</div>
			<div className="flex h-full flex-col gap-3 p-4 pl-5">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 rounded-full border px-1 py-1 text-xs">
						<button
							onClick={() => setActiveTab("properties")}
							className={cn(
								"rounded-full px-3 py-1",
								activeTab === "properties"
									? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
									: "text-neutral-600 dark:text-neutral-300",
							)}
						>
							Properties
						</button>
						<button
							onClick={() => setActiveTab("runs")}
							className={cn(
								"rounded-full px-3 py-1",
								activeTab === "runs"
									? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
									: "text-neutral-600 dark:text-neutral-300",
							)}
						>
							Runs
						</button>
					</div>
					<div>
						<button
							onClick={() => setPanelCollapsed(true)}
							className="rounded-full border px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
							type="button"
						>
							Hide
						</button>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto">
					{activeTab === "properties" ? (
						<PropertiesPanel
							selectedNode={selectedNode}
							onDeleteSelected={onDeleteSelected}
							onUpdateNode={onUpdateNode}
						/>
					) : (
						<RunsPanel
							isLoadingRunDetail={isLoadingRunDetail}
							onRefreshRuns={onRefreshRuns}
							onSelectRun={onSelectRun}
							runDetail={runDetail}
							runs={runs}
							selectedRunId={selectedRunId}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
