import { motion } from "framer-motion";
import {
	ChevronRight,
	Eraser,
	History,
	Image as ImageIcon,
	Layers,
	Plus,
	Search,
	Sparkles,
	Upload,
	Video,
	Wand2,
	Zap,
} from "lucide-react";
import React from "react";
import { SpinnerIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { styleModels } from "@/lib/models";
import { cn } from "@/lib/utils";
import { GenerationSettings } from "@/types/canvas";

interface AssistantPanelProps {
	prompt: string;
	setPrompt: (value: string) => void;
	generationSettings: GenerationSettings;
	setGenerationSettings: (settings: GenerationSettings) => void;
	isGenerating: boolean;
	isGeminiEditing: boolean;
	handleRun: () => void;
	handleGeminiEdit: () => void;
	handleUpload?: (files: FileList) => void;
	selectedIds: string[];
	className?: string;
}

type AssistantMode = "generate" | "edit" | "video";

export function AssistantPanel({
	prompt,
	setPrompt,
	generationSettings,
	setGenerationSettings,
	isGenerating,
	isGeminiEditing,
	handleRun,
	handleGeminiEdit,
	handleUpload,
	selectedIds,
	className,
}: AssistantPanelProps) {
	const [mode, setMode] = React.useState<AssistantMode>("generate");

	// Auto-switch mode based on selection
	React.useEffect(() => {
		if (selectedIds.length === 1) {
			setMode("edit");
		} else if (selectedIds.length === 0) {
			setMode("generate");
		}
	}, [selectedIds.length]);

	const handleStyleSelect = (styleId: string) => {
		const style = styleModels.find((s) => s.id === styleId);
		if (style) {
			setGenerationSettings({
				...generationSettings,
				styleId: style.id,
				prompt: style.prompt || generationSettings.prompt,
				loraUrl: style.loraUrl || "",
			});
		}
	};

	return (
		<div
			className={cn(
				"flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l border-border",
				className,
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-border">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
						<Sparkles className="w-4 h-4 text-primary" />
					</div>
					<div>
						<h2 className="text-sm font-semibold">Studio Assistant</h2>
						<p className="text-xs text-muted-foreground">
							{selectedIds.length > 0
								? `${selectedIds.length} item${selectedIds.length > 1 ? "s" : ""} selected`
								: "Ready to create"}
						</p>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-hidden">
				<div className="h-full overflow-y-auto p-4 space-y-6">
					{/* Quick Actions / Modes */}
					<div className="grid grid-cols-3 gap-2">
						<Button
							variant={mode === "generate" ? "secondary" : "outline"}
							size="sm"
							className="h-20 flex flex-col gap-2"
							onClick={() => setMode("generate")}
						>
							<ImageIcon className="w-5 h-5" />
							<span className="text-xs">Create</span>
						</Button>
						<Button
							variant={mode === "edit" ? "secondary" : "outline"}
							size="sm"
							className="h-20 flex flex-col gap-2"
							onClick={() => setMode("edit")}
						>
							<Wand2 className="w-5 h-5" />
							<span className="text-xs">Edit</span>
						</Button>
						<Button
							variant={mode === "video" ? "secondary" : "outline"}
							size="sm"
							className="h-20 flex flex-col gap-2"
							onClick={() => setMode("video")}
						>
							<Video className="w-5 h-5" />
							<span className="text-xs">Video</span>
						</Button>
					</div>

					{/* Contextual Tools */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium">
								{mode === "generate" && "Style Templates"}
								{mode === "edit" && "AI Tools"}
								{mode === "video" && "Video Effects"}
							</h3>
							{mode === "generate" && (
								<Button variant="ghost" size="icon" className="h-6 w-6">
									<Search className="w-3 h-3" />
								</Button>
							)}
						</div>

						{mode === "generate" && (
							<div className="space-y-3">
								<div className="grid grid-cols-2 gap-3">
									<Button
										variant="outline"
										className="h-full aspect-square flex flex-col items-center justify-center gap-2 border-dashed"
										onClick={() => {
											const input = document.createElement("input");
											input.type = "file";
											input.accept = "image/*";
											input.multiple = true;
											input.onchange = (e) => {
												const files = (e.target as HTMLInputElement).files;
												if (files && handleUpload) handleUpload(files);
											};
											input.click();
										}}
									>
										<Upload className="w-6 h-6 text-muted-foreground" />
										<span className="text-xs text-muted-foreground">
											Upload
										</span>
									</Button>
									{styleModels.slice(0, 5).map((style) => (
										<button
											key={style.id}
											onClick={() => handleStyleSelect(style.id)}
											className={cn(
												"group relative aspect-square rounded-lg overflow-hidden border transition-all hover:ring-2 hover:ring-primary",
												generationSettings.styleId === style.id
													? "ring-2 ring-primary border-primary"
													: "border-muted",
											)}
										>
											<img
												src={style.imageSrc}
												alt={style.name}
												className="w-full h-full object-cover transition-transform group-hover:scale-105"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
												<span className="text-xs text-white font-medium truncate w-full text-left">
													{style.name}
												</span>
											</div>
											{generationSettings.styleId === style.id && (
												<div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
											)}
										</button>
									))}
								</div>
							</div>
						)}

						{mode === "edit" && (
							<div className="space-y-2">
								<Button
									variant="outline"
									className="w-full justify-start"
									onClick={handleGeminiEdit}
									disabled={isGeminiEditing || selectedIds.length !== 1}
								>
									<Sparkles className="w-4 h-4 mr-2 text-amber-500" />
									Gemini Magic Editor
									{isGeminiEditing && (
										<SpinnerIcon className="w-3 h-3 ml-auto animate-spin" />
									)}
								</Button>
								<Button
									variant="outline"
									className="w-full justify-start"
									disabled
								>
									<Eraser className="w-4 h-4 mr-2" />
									Magic Eraser (Coming Soon)
								</Button>
								<Button
									variant="outline"
									className="w-full justify-start"
									disabled
								>
									<Zap className="w-4 h-4 mr-2" />
									Upscale Image (Coming Soon)
								</Button>
							</div>
						)}

						{mode === "video" && (
							<div className="p-4 rounded-lg border border-dashed text-center text-muted-foreground text-sm">
								Select an image to animate or a video to transform.
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Prompt Area - Sticky Bottom */}
			<div className="p-4 border-t border-border bg-background">
				<div className="space-y-3">
					<div className="relative">
						<Textarea
							value={prompt}
							onChange={(e) => {
								setPrompt(e.target.value);
								setGenerationSettings({
									...generationSettings,
									prompt: e.target.value,
								});
							}}
							placeholder={
								mode === "generate"
									? "Describe what you want to see..."
									: mode === "edit"
										? "Describe how to change the image..."
										: "Describe the video motion..."
							}
							className="min-h-[80px] resize-none pr-2 pb-2 text-sm bg-muted/30 focus:bg-background transition-colors"
						/>
						<Badge
							variant="outline"
							className="absolute bottom-2 right-2 text-[10px] opacity-50 bg-background/50 backdrop-blur"
						>
							{mode === "edit" ? "Gemini 2.5" : "Flux Dev"}
						</Badge>
					</div>

					<Button
						className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 transition-all"
						size="lg"
						onClick={mode === "edit" ? handleGeminiEdit : handleRun}
						disabled={
							isGenerating || isGeminiEditing || (!prompt && mode !== "edit")
						}
					>
						{isGenerating || isGeminiEditing ? (
							<>
								<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								Processing...
							</>
						) : (
							<>
								<Sparkles className="w-4 h-4 mr-2" />
								{mode === "generate"
									? "Generate"
									: mode === "edit"
										? "Magic Edit"
										: "Animate"}
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
