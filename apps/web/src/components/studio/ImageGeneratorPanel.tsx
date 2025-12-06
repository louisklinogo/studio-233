import { AnimatePresence, motion } from "framer-motion";
import {
	Image as ImageIcon,
	LayoutTemplate,
	Loader2,
	X,
	Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ASPECT_RATIOS, AVAILABLE_MODELS } from "@/constants/image-config";
import { useToast } from "@/hooks/use-toast";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useFalClient } from "@/hooks/useFalClient";
import { cn } from "@/lib/utils";

export interface ImageGeneratorSettings {
	prompt: string;
	modelId: string;
	aspectRatio: string;
	numImages: number;
	referenceImage?: string; // Data URL for reference image
}

interface ImageGeneratorPanelProps {
	isOpen: boolean;
	onClose: () => void;
	onRun: (settings: ImageGeneratorSettings) => void;
	isGenerating: boolean;
	initialPrompt?: string;
}

export const ImageGeneratorPanel: React.FC<ImageGeneratorPanelProps> = ({
	isOpen,
	onClose,
	onRun,
	isGenerating,
	initialPrompt = "",
}) => {
	const [prompt, setPrompt] = useState(initialPrompt);
	const [modelId, setModelId] = useState("gemini-2.5-flash-image-preview");
	const [aspectRatio, setAspectRatio] = useState("1:1");
	const [numImages, setNumImages] = useState(1); // Default to 1 for now
	const [referenceImage, setReferenceImage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const panelRef = useClickOutside<HTMLDivElement>(onClose);

	// Reset prompt when initialPrompt changes (external update)
	useEffect(() => {
		if (initialPrompt) {
			setPrompt(initialPrompt);
		}
	}, [initialPrompt]);

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!prompt.trim() || isGenerating) return;

		onRun({
			prompt,
			modelId,
			aspectRatio,
			numImages,
			referenceImage: referenceImage || undefined,
		});
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			setReferenceImage(e.target?.result as string);
		};
		reader.readAsDataURL(file);
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					ref={panelRef}
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 20, scale: 0.95 }}
					transition={{ duration: 0.2 }}
					className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-[440px] px-4"
				>
					<div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
						{/* Main Input Area */}
						<div className="p-4 space-y-4 bg-card">
							{referenceImage && (
								<div className="relative w-20 h-20 mb-2 group">
									<img
										src={referenceImage}
										alt="Reference"
										className="w-full h-full object-cover rounded-lg border border-border"
									/>
									<button
										onClick={() => setReferenceImage(null)}
										className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)}

							<Textarea
								placeholder="What are we creating today?"
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleSubmit();
									}
								}}
								className="min-h-[60px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-lg font-calibri placeholder:text-muted-foreground/50 bg-transparent"
								autoFocus
							/>

							{/* Controls Bar */}
							<div className="flex items-center justify-between pt-2 border-t border-border/50">
								<div className="flex items-center gap-1">
									{/* Model Selector */}
									<Select value={modelId} onValueChange={setModelId}>
										<SelectTrigger className="h-8 gap-2 border-none bg-transparent hover:bg-muted/50 rounded-lg px-2 text-xs font-medium font-outfit transition-colors focus:ring-0 focus:ring-offset-0 w-fit">
											<Zap className="h-3 w-3" />
											<SelectValue placeholder="Select Model" />
										</SelectTrigger>
										<SelectContent align="start" className="w-[200px]">
											{AVAILABLE_MODELS.map((model) => (
												<SelectItem
													key={model.id}
													value={model.id}
													className="font-outfit text-xs"
												>
													{model.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									{/* Image Upload Button */}
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleImageUpload}
										className="hidden"
										accept="image/*"
									/>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => fileInputRef.current?.click()}
										className={cn(
											"h-8 w-8 rounded-lg hover:bg-muted/50 transition-colors",
											referenceImage
												? "text-primary bg-primary/10"
												: "text-muted-foreground",
										)}
										title="Upload Reference Image"
									>
										<ImageIcon className="h-4 w-4" />
									</Button>
								</div>

								{/* Run Button */}
								<div className="flex items-center gap-2">
									{/* Aspect Ratio Selector */}
									<Select value={aspectRatio} onValueChange={setAspectRatio}>
										<SelectTrigger className="h-8 gap-2 border-none bg-transparent hover:bg-muted/50 rounded-lg px-2 text-xs font-medium font-outfit transition-colors focus:ring-0 focus:ring-offset-0 w-fit">
											<SelectValue>{aspectRatio}</SelectValue>
										</SelectTrigger>
										<SelectContent align="start" className="w-[160px]">
											{ASPECT_RATIOS.map((ratio) => (
												<SelectItem
													key={ratio.id}
													value={ratio.id}
													className="font-outfit text-xs"
												>
													{ratio.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<Button
										size="sm"
										onClick={handleSubmit}
										disabled={!prompt.trim() || isGenerating}
										className="h-7 rounded-lg px-3 font-outfit text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
									>
										{isGenerating ? (
											<>
												<Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
												Creating...
											</>
										) : (
											<>
												<Zap className="mr-1.5 h-3 w-3 fill-current" />
												Run
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
