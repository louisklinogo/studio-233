"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function EmptyStateInstructions() {
	return (
		<div className="flex flex-col items-center justify-center h-full p-8 text-center">
			<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
				<Sparkles className="w-8 h-8 text-muted-foreground" />
			</div>

			<h3 className="text-lg font-semibold mb-2">No Files Selected</h3>
			<p className="text-sm text-muted-foreground max-w-xs mb-6">
				Select files from the Input Queue on the left to configure your batch
				workflow.
			</p>

			<div className="flex gap-2 opacity-50">
				<Badge variant="outline" className="text-[10px] font-normal">
					PNG
				</Badge>
				<Badge variant="outline" className="text-[10px] font-normal">
					JPG
				</Badge>
				<Badge variant="outline" className="text-[10px] font-normal">
					WEBP
				</Badge>
			</div>
		</div>
	);
}
