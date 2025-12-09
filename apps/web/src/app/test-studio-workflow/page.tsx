"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EnhancedStudioExperimentsClient } from "@/components/studio-workflow/EnhancedStudioExperimentsClient";
import {
	ensurePluginsInitialized,
	getPluginsByCategory,
	pluginRegistry,
} from "@/lib/studio-workflow/plugins";

export default function TestStudioWorkflowPage() {
	const [pluginsInitialized, setPluginsInitialized] = useState(false);
	const [pluginStats, setPluginStats] = useState<any>(null);
	const [testProjectId] = useState("test-project-123");

	useEffect(() => {
		// Initialize plugins and get stats
		ensurePluginsInitialized()
			.then(() => {
				setPluginsInitialized(true);
				setPluginStats(pluginRegistry.getStats());
				toast.success("Plugins initialized successfully");
			})
			.catch((error) => {
				console.error("Failed to initialize plugins:", error);
				toast.error("Failed to initialize plugins");
			});
	}, []);

	const pluginsByCategory = pluginsInitialized ? getPluginsByCategory() : null;

	return (
		<div className="h-screen flex flex-col">
			{/* Header */}
			<div className="border-b bg-muted/30 p-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Studio+ Workflow Test</h1>
						<p className="text-muted-foreground">
							Testing the enhanced workflow builder with plugin architecture
						</p>
					</div>

					{/* Plugin Status */}
					<div className="text-right">
						<div className="text-sm">
							<span
								className={`inline-block w-2 h-2 rounded-full mr-2 ${
									pluginsInitialized ? "bg-green-500" : "bg-yellow-500"
								}`}
							/>
							{pluginsInitialized ? "Plugins Ready" : "Loading Plugins..."}
						</div>
						{pluginStats && (
							<div className="text-xs text-muted-foreground mt-1">
								{pluginStats.total} plugins ({pluginStats.enabled} enabled)
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Plugin Overview */}
			{pluginsByCategory && (
				<div className="border-b bg-muted/10 p-4">
					<h2 className="text-lg font-semibold mb-3">Available Plugins</h2>
					<div className="grid grid-cols-4 gap-4">
						<div className="bg-green-50 border border-green-200 rounded p-3">
							<h3 className="font-medium text-green-800">Input Sources</h3>
							<p className="text-sm text-green-600">
								{pluginsByCategory.input.length} plugins
							</p>
							<ul className="text-xs text-green-700 mt-1">
								{pluginsByCategory.input.map((plugin) => (
									<li key={plugin.id}>• {plugin.name}</li>
								))}
							</ul>
						</div>

						<div className="bg-blue-50 border border-blue-200 rounded p-3">
							<h3 className="font-medium text-blue-800">Media Processing</h3>
							<p className="text-sm text-blue-600">
								{pluginsByCategory.processing.length} plugins
							</p>
							<ul className="text-xs text-blue-700 mt-1">
								{pluginsByCategory.processing.map((plugin) => (
									<li key={plugin.id}>• {plugin.name}</li>
								))}
							</ul>
						</div>

						<div className="bg-purple-50 border border-purple-200 rounded p-3">
							<h3 className="font-medium text-purple-800">
								Output Destinations
							</h3>
							<p className="text-sm text-purple-600">
								{pluginsByCategory.output.length} plugins
							</p>
							<ul className="text-xs text-purple-700 mt-1">
								{pluginsByCategory.output.map((plugin) => (
									<li key={plugin.id}>• {plugin.name}</li>
								))}
							</ul>
						</div>

						<div className="bg-gray-50 border border-gray-200 rounded p-3">
							<h3 className="font-medium text-gray-800">Utilities</h3>
							<p className="text-sm text-gray-600">
								{pluginsByCategory.utility.length} plugins
							</p>
							<ul className="text-xs text-gray-700 mt-1">
								{pluginsByCategory.utility.map((plugin) => (
									<li key={plugin.id}>• {plugin.name}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}

			{/* Main Workflow Canvas */}
			<div className="flex-1">
				{pluginsInitialized ? (
					<EnhancedStudioExperimentsClient projectId={testProjectId} />
				) : (
					<div className="h-full flex items-center justify-center">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-muted-foreground">
								Initializing workflow system...
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
				<div className="flex items-center justify-between">
					<div>Studio+ Media Batch Processing Platform - Test Environment</div>
					<div className="flex items-center gap-4">
						<span>Project: {testProjectId}</span>
						{pluginStats && (
							<span>
								Plugins: {pluginStats.enabled}/{pluginStats.total} enabled
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
