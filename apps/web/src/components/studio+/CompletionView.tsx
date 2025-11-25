"use client";

import { motion } from "framer-motion";
import {
	CheckCircle,
	Download,
	RefreshCw,
	Plus,
	Check,
	X,
	Pause,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface JobStatus {
	id: string;
	originalUrl: string;
	resultUrl?: string;
	status:
		| "idle"
		| "uploading"
		| "processing"
		| "completed"
		| "failed"
		| "canceled";
	error?: string;
}

interface CompletionViewProps {
    jobs: JobStatus[];
    onDownloadAll?: () => void;
    onRetryFailed?: () => void;
    onNewBatch?: () => void;
    onImageClick?: (jobId: string) => void;
}

export function CompletionView({
    jobs,
    onDownloadAll,
    onRetryFailed,
    onNewBatch,
    onImageClick,
}: CompletionViewProps) {
    const totalCount = jobs.length;
	const successCount = jobs.filter((j) => j.status === "completed").length;
	const failedCount = jobs.filter((j) => j.status === "failed").length;
	const canceledCount = jobs.filter((j) => j.status === "canceled").length;

    return (
        <div className="flex flex-col h-full">
            {/* Success Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-8 bg-gradient-to-r from-green-500/10 to-green-600/10 border-b"
            >
                <div className="flex items-center gap-4">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                            duration: 0.6,
                            ease: "easeOut",
                        }}
                    >
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </motion.div>

                    <div>
                        <h2 className="text-2xl font-bold mb-1">Batch Complete!</h2>
					<p className="text-muted-foreground">
						Successfully processed {successCount}/{totalCount} images
						{canceledCount > 0 && (
							<span className="ml-1 text-amber-500">
								({canceledCount} canceled)
							</span>
						)}
					</p>
                    </div>
                </div>
            </motion.div>

            {/* Results Grid */}
            <ScrollArea className="flex-1 p-6">
                <div className="grid grid-cols-4 gap-4">
                    {jobs.map((job) => (
                        <motion.div
                            key={job.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => onImageClick?.(job.id)}
                        >
                            {/* Image */}
                            <img
                                src={job.resultUrl || job.originalUrl || "/placeholder.svg"}
                                alt="Result"
                                className="w-full h-full object-cover"
                            />

                            {/* Status Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {job.status === "completed" && (
                                    <div className="flex flex-col items-center gap-2">
                                        <Check className="w-8 h-8 text-green-500" />
                                        <Badge variant="secondary" className="text-xs">
                                            View Details
                                        </Badge>
                                    </div>
                                )}
						{job.status === "failed" && (
							<div className="flex flex-col items-center gap-2">
								<X className="w-8 h-8 text-red-500" />
								<Badge variant="destructive" className="text-xs">
									Failed
								</Badge>
							</div>
						)}
						{job.status === "canceled" && (
							<div className="flex flex-col items-center gap-2">
								<Pause className="w-8 h-8 text-amber-400" />
								<Badge variant="secondary" className="text-xs">
									Canceled
								</Badge>
							</div>
						)}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>

            {/* Action Buttons */}
            <div className="p-6 border-t bg-card flex gap-3">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={onDownloadAll}
                    className="flex-1"
                    disabled={successCount === 0}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download All ({successCount})
                </Button>

			{failedCount > 0 && (
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={onRetryFailed}
                        className="flex-1"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry Failed ({failedCount})
                    </Button>
                )}
			{canceledCount > 0 && (
				<Button
					size="lg"
					variant="outline"
					onClick={onRetryFailed}
					className="flex-1"
				>
					<RefreshCw className="w-4 h-4 mr-2" />
					Restart Canceled ({canceledCount})
				</Button>
			)}

                <Button
                    size="lg"
                    onClick={onNewBatch}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Batch
                </Button>
            </div>
        </div>
    );
}
