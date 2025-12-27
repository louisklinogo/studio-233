import { StudioBatchJob } from "@studio233/db";
import { motion } from "framer-motion";
import { Download, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<StudioBatchJob["status"], string> = {
	canceled: "Canceled",
	completed: "Completed",
	failed: "Failed",
	processing: "Processing",
	queued: "Queued",
	verifying: "Verifying",
};

const STATUS_VARIANTS: Record<
	StudioBatchJob["status"],
	"default" | "secondary" | "destructive" | "outline"
> = {
	canceled: "secondary",
	completed: "default",
	failed: "destructive",
	processing: "secondary",
	queued: "outline",
	verifying: "secondary",
};

interface ResultsGridProps {
	jobs: StudioBatchJob[];
	isProcessing: boolean;
}

export function ResultsGrid({ jobs, isProcessing }: ResultsGridProps) {
	if (jobs.length === 0 && !isProcessing) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
				<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 opacity-50">
					<RefreshCw className="w-8 h-8" />
				</div>
				<h3 className="text-lg font-medium">No Results Yet</h3>
				<p className="text-sm max-w-xs text-center mt-2">
					Upload images and run the batch to see generated results here.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6 overflow-auto pb-20">
			{jobs.map((job) => (
				<motion.div
					key={job.id}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="group relative bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all"
				>
					<div className="aspect-[3/4] relative bg-muted">
						{/* Result Image */}
						{job.resultUrl ? (
							<img
								src={job.resultUrl}
								alt="Result"
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/50 px-4 text-center">
								{job.status === "failed" ? (
									<>
										<span className="text-destructive text-sm font-semibold">
											Generation Failed
										</span>
										{job.error && (
											<span className="text-xs text-muted-foreground">
												{job.error}
											</span>
										)}
									</>
								) : job.status === "canceled" ? (
									<span className="text-amber-500 text-sm font-semibold">
										Job Canceled
									</span>
								) : (
									<div className="flex flex-col items-center gap-2">
										<div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
										<span className="text-xs text-muted-foreground">
											{job.status === "verifying"
												? "Verifying output..."
												: "Processing..."}
										</span>
									</div>
								)}
							</div>
						)}

						{/* Original Image Overlay (on hover) */}
						<div className="absolute top-2 left-2 w-12 h-16 rounded overflow-hidden border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-sm">
							<img
								src={job.imageUrl}
								alt="Original"
								className="w-full h-full object-cover opacity-80"
							/>
						</div>

						{/* Status Badge */}
						<div className="absolute top-2 right-2">
							<Badge
								variant={STATUS_VARIANTS[job.status]}
								className={
									job.status === "completed"
										? "bg-green-500/90 hover:bg-green-500"
										: job.status === "failed"
											? "bg-destructive/80 text-destructive-foreground"
											: ""
								}
							>
								{STATUS_LABELS[job.status]}
							</Badge>
						</div>

						{/* Actions Overlay */}
						{job.status === "completed" && job.resultUrl && (
							<div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 text-white hover:bg-white/20"
									asChild
								>
									<a href={job.resultUrl} download target="_blank">
										<Download className="w-4 h-4" />
									</a>
								</Button>
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 text-white hover:bg-white/20"
								>
									<ExternalLink className="w-4 h-4" />
								</Button>
							</div>
						)}
					</div>

					<div className="p-3 border-t bg-card/50">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span className="font-mono truncate max-w-[100px]">
								{job.id.slice(0, 8)}...
							</span>
							<span>{job.attempts} attempts</span>
						</div>
					</div>
				</motion.div>
			))}
		</div>
	);
}
