import { VideoGenerationSettings } from "@studio233/canvas";
import { ChevronRight, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	getDefaultVideoModel,
	getVideoModelById,
	type VideoModelConfig,
} from "@/lib/video-models";
import {
	ModelPricingDisplay,
	VideoModelOptions,
	VideoModelSelector,
} from "./VideoModelComponents";

interface ImageToVideoDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConvert: (settings: VideoGenerationSettings) => void;
	imageUrl: string;
	isConverting: boolean;
}

export const ImageToVideoDialog: React.FC<ImageToVideoDialogProps> = ({
	isOpen,
	onClose,
	onConvert,
	imageUrl,
	isConverting,
}) => {
	const defaultModel = getDefaultVideoModel("image-to-video");
	const [selectedModelId, setSelectedModelId] = useState(
		defaultModel?.id || "seedance-pro",
	);
	const [selectedModel, setSelectedModel] = useState<
		VideoModelConfig | undefined
	>(defaultModel);
	const [optionValues, setOptionValues] = useState<Record<string, any>>(
		defaultModel?.defaults || {},
	);
	const [showMoreOptions, setShowMoreOptions] = useState(false);

	// Update model when selection changes
	useEffect(() => {
		const model = getVideoModelById(selectedModelId);
		if (model) {
			setSelectedModel(model);
			setOptionValues(model.defaults);
		}
	}, [selectedModelId]);

	const handleOptionChange = (field: string, value: any) => {
		setOptionValues((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedModel) return;

		// Map the dynamic options to the VideoGenerationSettings format
		// This maintains backward compatibility with existing code
		const settings: VideoGenerationSettings = {
			prompt: optionValues.prompt || "",
			sourceUrl: imageUrl,
			modelId: selectedModel.id,
			// Include all option values for new models first
			...optionValues,
			// Then override with properly typed values
			...(optionValues.duration && {
				duration: parseInt(optionValues.duration),
			}),
			...(optionValues.seed !== undefined && { seed: optionValues.seed }),
		};

		onConvert(settings);
	};

	if (!selectedModel) return null;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[800px] p-0 gap-0 border-neutral-200 dark:border-neutral-800 rounded-none shadow-2xl overflow-hidden">
				<div className="flex h-[500px]">
					{/* Left Column - Image Preview */}
					<div className="w-[300px] bg-neutral-100 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-6 flex flex-col">
						<div className="mb-4">
							<h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">
								Source
							</h3>
							<div className="text-sm font-medium truncate">
								{selectedModel?.name}
							</div>
						</div>

						<div className="flex-1 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black relative">
							{imageUrl ? (
								<img
									src={imageUrl}
									alt="Source image"
									className="max-w-full max-h-full object-contain"
								/>
							) : (
								<div className="text-neutral-300 text-xs uppercase tracking-wider">
									No Image
								</div>
							)}
						</div>

						<div className="mt-4">
							<ModelPricingDisplay
								model={selectedModel}
								className="text-xs text-neutral-400"
							/>
						</div>
					</div>

					{/* Right Column - Controls */}
					<div className="flex-1 flex flex-col bg-background">
						<DialogHeader className="p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
							<DialogTitle className="text-sm font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 text-left">
								Image to Video
							</DialogTitle>
							<DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 text-left">
								Configure motion parameters.
							</DialogDescription>
						</DialogHeader>

						<form
							onSubmit={handleSubmit}
							className="flex-1 flex flex-col overflow-hidden"
						>
							<div className="flex-1 overflow-y-auto p-6 space-y-6">
								{/* Model Selection */}
								<div className="space-y-2">
									<label className="text-xs uppercase font-semibold tracking-wider text-neutral-900 dark:text-white">
										Model
									</label>
									<VideoModelSelector
										value={selectedModelId}
										onChange={setSelectedModelId}
										category="image-to-video"
										disabled={isConverting}
										className="rounded-none border-neutral-300 dark:border-neutral-700"
									/>
								</div>

								{/* Main Options */}
								<VideoModelOptions
									model={selectedModel}
									values={optionValues}
									onChange={handleOptionChange}
									disabled={isConverting}
									optionKeys={[
										"prompt",
										"resolution",
										"aspectRatio",
										"frameRate",
										"negativePrompt",
									]}
								/>

								{/* More Options Button */}
								{selectedModel &&
									Object.keys(selectedModel.options).length > 5 && (
										<Button
											type="button"
											variant="ghost"
											onClick={() => setShowMoreOptions(true)}
											className="px-0 flex gap-2 text-xs uppercase tracking-wider text-neutral-500 hover:text-neutral-900 hover:bg-transparent"
										>
											<ChevronRight className="h-3 w-3" />
											Advanced Settings
										</Button>
									)}
							</div>

							<DialogFooter className="p-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between gap-2 bg-neutral-50/50 dark:bg-neutral-900/10">
								<Button
									type="button"
									variant="ghost"
									onClick={onClose}
									disabled={isConverting}
									className="rounded-none text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
								>
									CANCEL
								</Button>
								<Button
									type="submit"
									disabled={isConverting}
									className="rounded-none bg-[#FF4D00] hover:bg-[#E04400] text-white font-medium px-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isConverting ? (
										<>
											<SpinnerIcon className="h-4 w-4 animate-spin text-white mr-2" />
											PROCESSING
										</>
									) : (
										<div className="flex items-center gap-2">
											<span>GENERATE</span>
										</div>
									)}
								</Button>
							</DialogFooter>
						</form>
					</div>
				</div>

				{/* Slide-out Panel for More Options */}
				{showMoreOptions && (
					<>
						<div
							className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-40"
							onClick={() => setShowMoreOptions(false)}
						/>
						<div className="absolute top-0 right-0 h-full w-[300px] bg-background border-l border-neutral-200 dark:border-neutral-800 z-50 shadow-xl flex flex-col">
							<div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
								<h3 className="text-xs font-bold uppercase tracking-widest">
									Advanced
								</h3>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setShowMoreOptions(false)}
									className="h-6 w-6 p-0 rounded-none hover:bg-neutral-100"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
							<div className="flex-1 overflow-y-auto p-4">
								<VideoModelOptions
									model={selectedModel}
									values={optionValues}
									onChange={handleOptionChange}
									disabled={isConverting}
									excludeKeys={[
										"prompt",
										"resolution",
										"aspectRatio",
										"frameRate",
										"negativePrompt",
									]}
								/>
							</div>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};
