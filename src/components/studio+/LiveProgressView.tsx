"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Check,
    Loader2,
    X,
    Activity,
    Download,
    Pause,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobStatus {
    id: string;
    originalUrl: string;
    resultUrl?: string;
    status: "idle" | "uploading" | "processing" | "completed" | "failed";
    attempt?: number;
    error?: string;
}

interface ActivityItem {
    id: string;
    fileName: string;
    message: string;
    timestamp: number;
}

interface LiveProgressViewProps {
    jobs: JobStatus[];
    isProcessing: boolean;
    onImageClick?: (jobId: string) => void;
    onPause?: () => void;
}

export function LiveProgressView({
    jobs,
    isProcessing,
    onImageClick,
    onPause,
}: LiveProgressViewProps) {
    const total = jobs.length;
    const completed = jobs.filter((j) => j.status === "completed").length;
    const processing = jobs.filter((j) => j.status === "processing").length;
    const failed = jobs.filter((j) => j.status === "failed").length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    // Mock activity feed (in real implementation, this would come from props)
    const activities: ActivityItem[] = jobs
        .slice(0, 10)
        .map((job, idx) => ({
            id: job.id,
            fileName: `image-${idx + 1}.jpg`,
            message:
                job.status === "completed"
                    ? "✓ Complete"
                    : job.status === "processing"
                        ? `Processing (Attempt ${job.attempt || 1}/7)`
                        : job.status === "failed"
                            ? "Failed"
                            : "Waiting",
            timestamp: Date.now() - idx * 1000,
        }));

    return (
        <div className="flex flex-col h-full">
            {/* Progress Header */}
            <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                {/* Overall Progress */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Processing Batch</h3>
                        <span className="text-2xl font-bold text-primary">
                            {Math.round(percentage)}%
                        </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-primary/60"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Stats Breakdown */}
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        <span className="text-muted-foreground">
                            Processing: {processing}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Done: {completed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-muted-foreground">Failed: {failed}</span>
                    </div>
                </div>
            </div>

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
                                src={job.originalUrl || "/placeholder.svg"}
                                alt="Processing"
                                className="w-full h-full object-cover"
                            />

                            {/* Status Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                {job.status === "completed" && (
                                    <Check className="w-8 h-8 text-green-500" />
                                )}
                                {job.status === "processing" && (
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                )}
                                {job.status === "failed" && (
                                    <X className="w-8 h-8 text-red-500" />
                                )}
                            </div>

                            {/* Attempt Count (if retrying) */}
                            {job.attempt && job.attempt > 1 && (
                                <Badge className="absolute top-2 right-2 text-xs">
                                    Attempt {job.attempt}/7
                                </Badge>
                            )}
                        </motion.div>
                    ))}
                </div>
            </ScrollArea>

            {/* Live Activity Feed */}
            <div className="border-t bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <h4 className="font-medium text-sm">Live Activity</h4>
                    </div>
                    {onPause && isProcessing && (
                        <Button size="sm" variant="outline" onClick={onPause}>
                            <Pause className="w-3 h-3 mr-1" />
                            Pause
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-32">
                    <AnimatePresence mode="popLayout">
                        {activities.slice(0, 10).map((activity) => (
                            <motion.div
                                key={activity.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-start gap-2 mb-2 text-xs"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <div>
                                    <span className="font-medium">{activity.fileName}:</span>
                                    <span className="text-muted-foreground ml-1">
                                        {activity.message}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </ScrollArea>
            </div>
        </div>
    );
}
