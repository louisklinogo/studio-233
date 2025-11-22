import { Eraser, Image, RefreshCw, Wand2 } from "lucide-react";
import React from "react";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { EmptyStateTypewriter } from "./EmptyStateTypewriter";
import { GlitchText } from "./GlitchText";

interface StudioChatWelcomeProps {
	onSelectSuggestion: (suggestion: string) => void;
	hasFiles: boolean;
	fileCount: number;
}

export const StudioChatWelcome: React.FC<StudioChatWelcomeProps> = ({
	onSelectSuggestion,
	hasFiles,
	fileCount,
}) => {
	const [isHovered, setIsHovered] = React.useState(false);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	const handleMouseEnter = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		setIsHovered(true);
	};

	const handleMouseLeave = () => {
		timeoutRef.current = setTimeout(() => {
			setIsHovered(false);
		}, 300); // Add a small delay before disabling glitch
	};

	const suggestions = hasFiles
		? [
				"Remove backgrounds from all images",
				"Resize to 1080x1080 squares",
				"Convert to high-quality WebP",
				"Analyze image content and metadata",
			]
		: [
				"How do I batch process images?",
				"What formats are supported?",
				"Show me a demo workflow",
			];

	return (
		<div className="flex flex-col h-full p-8 pb-2 text-center animate-in fade-in zoom-in-95 duration-300">
			{/* Top Section: 3D Element + Text - Centered vertically in remaining space */}
			<div className="flex-1 flex flex-col items-center justify-center gap-4">
				<div className="h-48 flex items-center justify-center">
					<EmptyStateTypewriter />
				</div>

				<div
					className="flex flex-col items-center gap-4 max-w-md"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					{hasFiles && (
						<h3 className="text-xl font-semibold">
							Ready to process {fileCount} files
						</h3>
					)}

					<p className="text-sm text-muted-foreground leading-relaxed">
						{hasFiles ? (
							"I can run custom scripts to transform, rename, or analyze your selected assets. Just ask or choose a starter."
						) : (
							<GlitchText
								text="Drag and drop images to the sidebar to begin batch processing with AI-powered code execution."
								trigger={isHovered}
							/>
						)}
					</p>
				</div>
			</div>

			{/* Bottom Section: Suggestion Pills - Anchored to bottom */}
			{/* <div className="w-full mt-8 flex justify-center px-4">
				<div className="w-full max-w-[600px] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hasFiles && (
                        <>
                             <button
                                onClick={() => onSelectSuggestion("Remove backgrounds from all images")}
                                className="flex flex-col items-start p-3 rounded-xl border bg-card hover:bg-accent/50 transition-all text-left group"
                            >
                                <div className="p-2 rounded-lg bg-red-500/10 text-red-500 mb-2 group-hover:scale-110 transition-transform">
                                    <Eraser className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">Remove Backgrounds</span>
                                <span className="text-xs text-muted-foreground mt-1">Clean up product shots</span>
                            </button>

                            <button
                                onClick={() => onSelectSuggestion("Resize to 1080x1080 squares")}
                                className="flex flex-col items-start p-3 rounded-xl border bg-card hover:bg-accent/50 transition-all text-left group"
                            >
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                                    <RefreshCw className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">Smart Resize</span>
                                <span className="text-xs text-muted-foreground mt-1">Standardize dimensions</span>
                            </button>

                             <button
                                onClick={() => onSelectSuggestion("Convert to high-quality WebP")}
                                className="flex flex-col items-start p-3 rounded-xl border bg-card hover:bg-accent/50 transition-all text-left group"
                            >
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-500 mb-2 group-hover:scale-110 transition-transform">
                                    <Image className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">Convert Format</span>
                                <span className="text-xs text-muted-foreground mt-1">Optimize for web</span>
                            </button>

                             <button
                                onClick={() => onSelectSuggestion("Analyze image content and metadata")}
                                className="flex flex-col items-start p-3 rounded-xl border bg-card hover:bg-accent/50 transition-all text-left group"
                            >
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 mb-2 group-hover:scale-110 transition-transform">
                                    <Wand2 className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">Analyze Content</span>
                                <span className="text-xs text-muted-foreground mt-1">Generate metadata</span>
                            </button>
                        </>
                    )}
				</div>

                {!hasFiles && (
                     <Suggestions>
                        {suggestions.map((suggestion) => (
                            <Suggestion
                                key={suggestion}
                                onClick={onSelectSuggestion}
                                suggestion={suggestion}
                                className="justify-center w-full"
                            />
                        ))}
                    </Suggestions>
                )}
			</div> */}
		</div>
	);
};
