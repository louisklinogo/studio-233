"use client";

import { motion } from "framer-motion";
import { SwissIcons } from "@/components/ui/SwissIcons";

interface FilmstripOverlayProps {
	isOpen: boolean;
	onClose: () => void;
	selectedNodeId?: string;
}

export function FilmstripOverlay({
	isOpen,
	onClose,
	selectedNodeId,
}: FilmstripOverlayProps) {
	// Mock images for the filmstrip
	const mockImages = [1, 2, 3, 4, 5];

	return (
		<motion.div
			initial={{ y: "100%" }}
			animate={{ y: isOpen ? 0 : "100%" }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className="fixed bottom-0 left-0 right-0 z-40 h-64 bg-[#e5e5e5] dark:bg-[#1a1a1a] border-t border-neutral-300 dark:border-neutral-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col"
		>
			{/* Handle / Header */}
			<div className="h-8 flex items-center justify-between px-4 bg-neutral-200 dark:bg-[#222] border-b border-neutral-300 dark:border-neutral-800">
				<div className="flex items-center gap-2">
					<SwissIcons.Film size={14} className="text-[#FF4D00]" />
					<span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
						Live Output: {selectedNodeId || "NO_SELECTION"}
					</span>
				</div>
				<button
					onClick={onClose}
					className="w-6 h-6 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-[2px]"
				>
					<SwissIcons.ChevronDown size={14} />
				</button>
			</div>

			{/* Filmstrip Content */}
			<div className="flex-1 overflow-x-auto p-4 flex gap-4 items-center bg-[#f4f4f0] dark:bg-[#111]">
				{/* Empty State or Images */}
				{!selectedNodeId ? (
					<div className="w-full flex flex-col items-center justify-center text-neutral-400">
						<SwissIcons.Square size={24} className="mb-2 opacity-50" />
						<span className="text-[10px] font-mono uppercase">
							Select a node to view output
						</span>
					</div>
				) : (
					mockImages.map((i) => (
						<div
							key={i}
							className="relative flex-shrink-0 w-48 aspect-[4/5] bg-neutral-300 dark:bg-neutral-800 rounded-[2px] border border-neutral-300 dark:border-neutral-700 overflow-hidden group"
						>
							{/* Placeholder Image */}
							<div className="absolute inset-0 flex items-center justify-center text-neutral-500 font-mono text-xs">
								IMG_00{i}.RAW
							</div>

							{/* Overlay Data */}
							<div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
								<div className="flex justify-between text-[9px] font-mono text-white">
									<span>CONF: 0.9{i}</span>
									<span className="text-[#00C040]">PASS</span>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</motion.div>
	);
}
