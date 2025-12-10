"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	GripVertical,
	PanelRight,
	Settings2,
	TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	nodesAtom,
	panelCollapsedAtom,
	panelWidthAtom,
	selectedNodeIdAtom,
	updateNodeDataAtom,
	type WorkflowNodeData,
} from "@/lib/studio-workflow/enhanced-store";
import {
	ensurePluginsInitialized,
	getPluginForNode,
	pluginRegistry,
} from "@/lib/studio-workflow/plugins";
import type {
	MediaPlugin,
	PluginConfig,
} from "@/lib/studio-workflow/plugins/types";
import { cn } from "@/lib/utils";

function PanelShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="space-y-3 text-sm leading-relaxed text-neutral-800 dark:text-neutral-100">
			{children}
		</div>
	);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-xs uppercase tracking-[0.08em] text-neutral-500 dark:text-neutral-400">
			{children}
		</p>
	);
}

function ErrorCallout({ message }: { message: string }) {
	return (
		<div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
			<TriangleAlert className="mt-0.5 h-4 w-4" />
			<span>{message}</span>
		</div>
	);
}

export function EnhancedRightPanel() {
	const [panelWidth, setPanelWidth] = useAtom(panelWidthAtom);
	const [panelCollapsed, setPanelCollapsed] = useAtom(panelCollapsedAtom);
	const nodes = useAtomValue(nodesAtom);
	const selectedNodeId = useAtomValue(selectedNodeIdAtom);
	const updateNodeData = useSetAtom(updateNodeDataAtom);
	const resizingRef = useRef(false);
	const [availablePlugins, setAvailablePlugins] = useState<MediaPlugin[]>([]);
	const selectedNode = useMemo(
		() => nodes.find((node) => node.id === selectedNodeId),
		[nodes, selectedNodeId],
	);

	useEffect(() => {
		ensurePluginsInitialized()
			.then(() =>
				setAvailablePlugins(
					pluginRegistry.getEnabled().map((entry) => entry.plugin),
				),
			)
			.catch(() =>
				setAvailablePlugins(
					pluginRegistry.getEnabled().map((entry) => entry.plugin),
				),
			);
	}, []);

	const plugin = selectedNode?.data?.pluginId
		? getPluginForNode(selectedNode.data.pluginId)
		: undefined;

	const currentConfig =
		(selectedNode?.data?.config as PluginConfig) ?? plugin?.defaultConfig ?? {};
	const validation = plugin?.validateConfig(currentConfig);

	const ConfigComponent = plugin?.configComponent;

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

	const handlePluginChange = (pluginId: string) => {
		const nextPlugin = getPluginForNode(pluginId);
		if (!selectedNode || !nextPlugin) return;
		updateNodeData({
			id: selectedNode.id,
			data: {
				pluginId,
				config: nextPlugin.defaultConfig ?? {},
				description: selectedNode.data?.description,
				label: selectedNode.data?.label ?? nextPlugin.name,
			},
		});
	};

	const handleConfigChange = (config: PluginConfig) => {
		if (!selectedNode) return;
		updateNodeData({ id: selectedNode.id, data: { config } });
	};

	const handleLabelChange = (value: string) => {
		if (!selectedNode) return;
		updateNodeData({ id: selectedNode.id, data: { label: value } });
	};

	const handleDescriptionChange = (value: string) => {
		if (!selectedNode) return;
		updateNodeData({ id: selectedNode.id, data: { description: value } });
	};

	if (panelCollapsed) {
		return (
			<button
				className="pointer-events-auto absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-l-full border border-r-0 bg-white px-2 py-1 text-sm shadow dark:bg-black"
				onClick={() => setPanelCollapsed(false)}
				type="button"
			>
				<PanelRight className="h-4 w-4" />
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
					<GripVertical className="h-3 w-3" />
				</div>
			</div>
			<div className="flex h-full flex-col gap-3 p-4 pl-5">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 rounded-full border px-2 py-1 text-xs">
						<Settings2 className="h-3.5 w-3.5" />
						<span className="font-semibold">Configuration</span>
					</div>
					<button
						onClick={() => setPanelCollapsed(true)}
						className="text-xs text-neutral-500 hover:text-neutral-800"
						type="button"
					>
						Collapse
					</button>
				</div>

				{!selectedNode ? (
					<div className="flex h-full items-center justify-center text-sm text-neutral-500">
						<p>Select a node to configure it.</p>
					</div>
				) : (
					<PanelShell>
						<div className="space-y-2">
							<SectionTitle>Node</SectionTitle>
							<input
								value={selectedNode.data?.label ?? ""}
								onChange={(e) => handleLabelChange(e.target.value)}
								placeholder="Label"
								className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1 text-sm"
							/>
							<textarea
								value={selectedNode.data?.description ?? ""}
								onChange={(e) => handleDescriptionChange(e.target.value)}
								placeholder="Description"
								rows={2}
								className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1 text-sm"
							/>
						</div>

						<div className="space-y-2">
							<SectionTitle>Plugin</SectionTitle>
							<select
								value={selectedNode.data?.pluginId ?? ""}
								onChange={(e) => handlePluginChange(e.target.value)}
								className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1 text-sm"
							>
								<option value="" disabled>
									Select a plugin
								</option>
								{availablePlugins.map((entry) => (
									<option key={entry.id} value={entry.id}>
										{entry.name}
									</option>
								))}
							</select>
							{!selectedNode.data?.pluginId && (
								<ErrorCallout message="Assign a plugin to run this node." />
							)}
						</div>

						{plugin && ConfigComponent ? (
							<div className="space-y-2">
								<SectionTitle>Configuration</SectionTitle>
								<div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
									<ConfigComponent
										config={currentConfig}
										onChange={handleConfigChange}
										errors={undefined}
									/>
								</div>
								{validation && !validation.valid ? (
									<ErrorCallout message={validation.errors.join(", ")} />
								) : null}
							</div>
						) : null}
					</PanelShell>
				)}
			</div>
		</div>
	);
}
